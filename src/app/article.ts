import { isNull, negate, pipe } from "@fxts/core";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { assertModule, compare } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

import { Prisma, users } from "../../db/edge";

export interface Article {
    readonly getList: (
        input: IArticle.ISearch,
    ) => Promise<Result.Ok<IArticle.IPaginatedResponse>>;

    readonly get: (
        tx?: Prisma.TransactionClient,
    ) => (
        input: IArticle.Identity,
    ) => Promise<
        Result<IArticle, Failure.Internal<ErrorCode.Article.NotFound>>
    >;

    readonly create: (
        tx?: Prisma.TransactionClient,
    ) => (
        author_id: string & typia.tags.Format<"uuid">,
    ) => (input: IArticle.ICreate) => Promise<Result.Ok<IArticle.Identity>>;

    readonly update: (
        tx?: Prisma.TransactionClient,
    ) => (
        author_id: string & typia.tags.Format<"uuid">,
    ) => (
        identity: IArticle.Identity,
    ) => (
        input: IArticle.ICreate,
    ) => Promise<
        Result<
            IArticle.Identity,
            Failure.Internal<
                ErrorCode.Article.NotFound | ErrorCode.Permission.Insufficient
            >
        >
    >;

    readonly remove: (
        tx?: Prisma.TransactionClient,
    ) => (
        author_id: string & typia.tags.Format<"uuid">,
    ) => (
        identity: IArticle.Identity,
    ) => Promise<
        Result<
            IArticle.Identity,
            Failure.Internal<
                ErrorCode.Article.NotFound | ErrorCode.Permission.Insufficient
            >
        >
    >;
}

export namespace Article {
    export const access =
        (tx: Prisma.TransactionClient = prisma) =>
        async ({
            permission,
            user_id,
            article_id,
        }: {
            permission: "read" | "write";
            user_id: string & typia.tags.Format<"uuid">;
            article_id: string & typia.tags.Format<"uuid">;
        }): Promise<
            Result<
                true,
                Failure.Internal<
                    | ErrorCode.Permission.Insufficient
                    | ErrorCode.Article.NotFound
                >
            >
        > => {
            const article = await tx.articles.findFirst({
                where: { id: article_id },
                select: { id: true, author_id: true, deleted_at: true },
            });
            if (isNull(article))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            if (negate(isNull)(article.deleted_at))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            if (permission === "write" && article.author_id !== user_id)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Insufficient>(
                        "INSUFFICIENT_PERMISSION",
                    ),
                );
            return Result.Ok.map(true);
        };
    export const getList: Article["getList"] = ({
        skip = 0,
        limit = 10,
        posted_at = "desc",
    }) =>
        pipe(
            ArticleEntity.Summary.select(),
            async (select) =>
                prisma.articles.findMany({
                    select,
                    where: { deleted_at: null },
                    skip,
                    take: limit,
                    orderBy: { created_at: posted_at },
                }),
            ArticleEntity.Summary.map,
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
        (author_id) =>
        async (input) => {
            const article_id = Random.uuid();
            const created_at = DateMapper.toISO();
            await tx.articles.create({
                data: {
                    id: article_id,
                    author_id: author_id,
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
        (author_id) =>
        ({ article_id }) =>
        async (input) => {
            const permission = await access(tx)({
                permission: "write",
                user_id: author_id,
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
        (author_id) =>
        async ({ article_id }) => {
            const permission = await access(tx)({
                permission: "write",
                user_id: author_id,
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
    export const mapAuthor = (
        author: Pick<users, "id" | "name" | "image_url" | "deleted_at">,
    ): IArticle.IAuthor => {
        return isNull(author.deleted_at)
            ? {
                  id: author.id,
                  name: author.name,
                  image_url: author.image_url,
              }
            : {
                  id: author.id,
                  name: "deleted user",
                  image_url: null,
              };
    };

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
            list: Awaited<
                ReturnType<
                    typeof prisma.articles.findMany<{
                        select: ReturnType<typeof select>;
                    }>
                >
            >,
        ): IArticle.ISummary[] =>
            list.map((value) => {
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
                    author: mapAuthor(value.author),
                    title: last_snapshot.title,
                    posted_at: DateMapper.toISO(value.created_at),
                    updated_at: isEdited ? last_snapshot.created_at : null,
                };
            });
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
        input: NonNullable<
            Awaited<
                ReturnType<
                    typeof prisma.articles.findFirst<{
                        select: ReturnType<typeof select>;
                    }>
                >
            >
        >,
    ): IArticle => ({
        id: input.id,
        author: mapAuthor(input.author),
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
