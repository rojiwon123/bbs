import { isNull, map, negate, pipe, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import "@APP/types/IUser";
import { IUser } from "@APP/types/IUser";
import { PrismaReturn } from "@APP/types/global";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { assertModule, compare } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";
import { UserEntity } from "./user";

export interface Article {
    readonly checkUpdatePermission: (
        tx?: Prisma.TransactionClient,
    ) => (
        requestor: IUser.Identity,
    ) => (
        identity: IArticle.Identity,
    ) => Promise<
        Result<
            null,
            Failure.Internal<
                ErrorCode.Permission.Insufficient | ErrorCode.Article.NotFound
            >
        >
    >;

    readonly getList: (
        tx?: Prisma.TransactionClient,
    ) => (
        input: IArticle.ISearch,
    ) => Promise<Result.Ok<IArticle.IPaginatedResponse>>;

    readonly get: (
        tx?: Prisma.TransactionClient,
    ) => (
        identity: IArticle.Identity,
    ) => Promise<
        Result<IArticle, Failure.Internal<ErrorCode.Article.NotFound>>
    >;

    readonly create: (
        tx?: Prisma.TransactionClient,
    ) => (
        requestor: IUser.Identity,
    ) => (input: IArticle.ICreate) => Promise<Result.Ok<IArticle.Identity>>;

    readonly update: (
        tx?: Prisma.TransactionClient,
    ) => (
        requestor: IUser.Identity,
    ) => (
        identity: IArticle.Identity,
    ) => (
        input: IArticle.IUpdate,
    ) => Promise<
        Result<
            IArticle.Identity,
            Failure.Internal<
                ErrorCode.Permission.Insufficient | ErrorCode.Article.NotFound
            >
        >
    >;

    readonly remove: (
        tx?: Prisma.TransactionClient,
    ) => (
        requestor: IUser.Identity,
    ) => (
        identity: IArticle.Identity,
    ) => Promise<
        Result<
            IArticle.Identity,
            Failure.Internal<
                ErrorCode.Permission.Insufficient | ErrorCode.Article.NotFound
            >
        >
    >;
}

export namespace Article {
    export const checkUpdatePermission: Article["checkUpdatePermission"] =
        (tx = prisma) =>
        ({ user_id: author_id }) =>
        async ({ article_id }) => {
            const article = await tx.articles.findFirst({
                where: { id: article_id },
                select: { id: true, author_id: true, deleted_at: true },
            });
            if (isNull(article) || negate(isNull)(article.deleted_at))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            if (article.author_id !== author_id)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Insufficient>(
                        "INSUFFICIENT_PERMISSION",
                    ),
                );
            return Result.Ok.map(null);
        };

    export const getList: Article["getList"] =
        (tx = prisma) =>
        ({ skip = 0, limit = 10, posted_at = "desc" }) =>
            pipe(
                ArticleEntity.Summary.select(),
                async (select) =>
                    tx.articles.findMany({
                        select,
                        where: { deleted_at: null },
                        skip,
                        take: limit,
                        orderBy: { created_at: posted_at },
                    }),
                map(ArticleEntity.Summary.map),
                toArray,
                (data): IArticle.IPaginatedResponse => ({ skip, limit, data }),
                Result.Ok.map,
            );

    export const get: Article["get"] =
        (tx = prisma) =>
        ({ article_id }) =>
            pipe(
                article_id,

                async (id) =>
                    tx.articles.findFirst({
                        where: { id, deleted_at: null },
                        select: ArticleEntity.select(),
                    }),

                (article) =>
                    isNull(article)
                        ? Result.Error.map(
                              new Failure.Internal<ErrorCode.Article.NotFound>(
                                  "NOT_FOUND_ARTICLE",
                              ),
                          )
                        : Result.Ok.map(ArticleEntity.map(article)),
            );

    export const create: Article["create"] =
        (tx = prisma) =>
        ({ user_id: author_id }) =>
        async (input) => {
            const article_id = Random.uuid();
            const created_at = DateMapper.toISO();
            await tx.articles.create({
                data: {
                    id: article_id,
                    author_id,
                    snapshots: {
                        create: {
                            id: Random.uuid(),
                            title: input.title,
                            body_url: input.body_url,
                            body_format: input.body_format,
                            created_at,
                        },
                    },
                    created_at,
                },
            });
            return Result.Ok.map({ article_id });
        };

    export const update: Article["update"] =
        (tx = prisma) =>
        ({ user_id }) =>
        ({ article_id }) =>
        async (input) => {
            const permission = await checkUpdatePermission(tx)({ user_id })({
                article_id,
            });
            if (Result.Error.is(permission)) return permission;
            await tx.article_snapshots.create({
                data: {
                    id: Random.uuid(),
                    article_id: article_id,
                    title: input.title,
                    body_url: input.body_url,
                    body_format: input.body_format,
                    created_at: DateMapper.toISO(),
                },
            });
            return Result.Ok.map({ article_id });
        };

    export const remove: Article["remove"] =
        (tx = prisma) =>
        ({ user_id }) =>
        async ({ article_id }) => {
            const permission = await checkUpdatePermission(tx)({ user_id })({
                article_id,
            });
            if (Result.Error.is(permission)) return permission;
            await tx.articles.updateMany({
                where: { id: article_id },
                data: { deleted_at: DateMapper.toISO() },
            });
            return Result.Ok.map({ article_id });
        };
}

export namespace ArticleEntity {
    export namespace Summary {
        export const select = () =>
            ({
                id: true,
                created_at: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        image_url: true,
                        deleted_at: true,
                    },
                },
                snapshots: {
                    select: {
                        title: true,
                        created_at: true,
                    },
                },
            }) satisfies Prisma.articlesSelect;

        export const map = (
            value: PrismaReturn<
                typeof prisma.articles.findFirst<{
                    select: ReturnType<typeof select>;
                }>
            >,
        ): IArticle.ISummary => {
            const isEdited = value.snapshots.length > 1;
            const snapshots = value.snapshots.sort(
                compare("desc")((a) => a.created_at.getTime()),
            );

            const last_snapshot = {
                title: snapshots.at(0)?.title ?? "",
                created_at: DateMapper.toISO(
                    snapshots.at(0)?.created_at ?? value.created_at,
                ),
            };

            return {
                id: value.id,
                author: isNull(value.author.deleted_at)
                    ? { status: "deleted" }
                    : UserEntity.mapAuthor(value.author),
                title: last_snapshot.title,
                posted_at: DateMapper.toISO(value.created_at),
                updated_at: isEdited ? last_snapshot.created_at : null,
            };
        };
    }

    export const select = () =>
        ({
            id: true,
            created_at: true,
            deleted_at: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    image_url: true,
                    deleted_at: true,
                },
            },
            snapshots: {
                select: {
                    title: true,
                    body_format: true,
                    body_url: true,
                    created_at: true,
                },
            },
        }) satisfies Prisma.articlesSelect;

    export const map = (
        input: PrismaReturn<
            typeof prisma.articles.findFirst<{
                select: ReturnType<typeof select>;
            }>
        >,
    ): IArticle => ({
        id: input.id,
        author: isNull(input.author.deleted_at)
            ? { status: "deleted" }
            : UserEntity.mapAuthor(input.author),
        snapshots: input.snapshots
            .sort(compare("desc")((a) => a.created_at.getTime()))
            .map((snapshot) => ({
                ...snapshot,
                created_at: DateMapper.toISO(snapshot.created_at),
            })),
        posted_at: DateMapper.toISO(input.created_at),
    });
}

assertModule<Article>(Article);
