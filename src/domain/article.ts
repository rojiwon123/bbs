import { isNull, map, pipe, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { IBoard } from "@APP/types/IBoard";
import { IMembership } from "@APP/types/IMembership";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";

export namespace Article {
    export const create =
        (tx: Prisma.TransactionClient = prisma) =>
        async (input: IArticle.ICreate) => {
            const created_at = DateMapper.toISO();
            const article_id = Random.uuid();
            await tx.articles.create({
                data: {
                    id: article_id,
                    board_id: input.board_id,
                    author_id: input.author_id,
                    is_notice: false,
                    created_at,
                    deleted_at: null,
                    snapshots: {
                        create: {
                            id: Random.uuid(),
                            title: input.title,
                            body_format: input.format,
                            body_url: input.url,
                            created_at,
                        },
                    },
                },
            });
            return Result.Ok.map<IArticle.Identity>({ article_id });
        };

    export const getList =
        (tx: Prisma.TransactionClient = prisma) =>
        (input: {
            where?: Prisma.articlesWhereInput;
            skip: number;
            take: number;
            orderBy: Prisma.articlesOrderByWithRelationInput;
        }) =>
            pipe(
                input,
                async ({ where = {}, skip, take, orderBy }) =>
                    tx.articles.findMany({
                        where: { ...where, deleted_at: null },
                        skip,
                        take,
                        orderBy,
                        select: {
                            id: true,
                            created_at: true,
                            deleted_at: true,
                            snapshots: ArticleJson.selectSnapshots({
                                title: true,
                                created_at: true,
                            }),
                            author: { select: ArticleJson.selectAuthor() },
                            board: {
                                select: ArticleJson.selectBoard(),
                            },
                        },
                    }),
                map((article): IArticle.ISummary => {
                    const author: IArticle.IAuthor = ArticleJson.mapAuthor(
                        article.author,
                    );

                    const snapshot = article.snapshots.at(-1) ?? null;
                    return {
                        id: article.id,
                        title: isNull(snapshot) ? null : snapshot.title,
                        author,
                        created_at: DateMapper.toISO(article.created_at),
                        updated_at: isNull(snapshot)
                            ? null
                            : article.created_at < snapshot.created_at
                            ? DateMapper.toISO(snapshot.created_at)
                            : null,
                    };
                }),
                toArray,
            );

    export const get =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: Prisma.articlesWhereInput,
        ): Promise<
            Result<IArticle, Failure.Internal<ErrorCode.Article.NotFound>>
        > => {
            const article = await tx.articles.findFirst({
                where: input,
                select: {
                    id: true,
                    author: {
                        select: ArticleJson.selectAuthor(),
                    },
                    snapshots: ArticleJson.selectSnapshots({
                        title: true,
                        created_at: true,
                        body_format: true,
                        body_url: true,
                    }),
                    board: { select: ArticleJson.selectBoard() },
                    is_notice: true,
                    created_at: true,
                    deleted_at: true,
                },
            });
            if (!Entity.exist(article))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );

            const snapshot = article.snapshots.at(-1) ?? null;
            return Result.Ok.map<IArticle>({
                id: article.id,
                author: ArticleJson.mapAuthor(article.author),
                title: isNull(snapshot) ? null : snapshot.title,
                body: isNull(snapshot)
                    ? null
                    : { format: snapshot.body_format, url: snapshot.body_url },
                is_notice: article.is_notice,
                board: { id: article.board.id, name: article.board.name },
                created_at: DateMapper.toISO(article.created_at),
                updated_at: isNull(snapshot)
                    ? null
                    : article.created_at < snapshot.created_at
                    ? DateMapper.toISO(snapshot.created_at)
                    : null,
            });
        };

    export const update =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: IArticle.IUpdate,
        ): Promise<Result.Ok<IArticle.Identity>> => {
            await tx.article_snapshots.create({
                data: {
                    id: Random.uuid(),
                    article_id: input.id,
                    title: input.title,
                    body_format: input.format,
                    body_url: input.url,
                    created_at: DateMapper.toISO(),
                },
            });
            return Result.Ok.map({ article_id: input.id });
        };

    export const setNotice =
        (tx: Prisma.TransactionClient = prisma) =>
        async ({
            board_id,
            article_ids,
            is_notice,
        }: IArticle.ISetNoticeInput): Promise<Result.Ok<number>> => {
            const { count } = await tx.articles.updateMany({
                where: {
                    id: { in: article_ids },
                    board_id,
                    deleted_at: null,
                },
                data: { is_notice },
            });
            return Result.Ok.map(count);
        };

    export const remove =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            identity: IArticle.Identity & IBoard.Identity,
        ): Promise<Result.Ok<IArticle.Identity>> => {
            await tx.articles.updateMany({
                where: {
                    id: identity.article_id,
                    board_id: identity.board_id,
                    deleted_at: null,
                },
                data: { deleted_at: DateMapper.toISO() },
            });
            return Result.Ok.map({ article_id: identity.article_id });
        };
}

export namespace ArticleJson {
    export const selectAuthor = () =>
        ({
            id: true,
            name: true,
            image_url: true,
            deleted_at: true,
            membership: {
                select: {
                    id: true,
                    name: true,
                    image_url: true,
                    rank: true,
                    deleted_at: true,
                },
            },
        }) satisfies Prisma.usersSelect;

    export const selectBoard = () =>
        ({
            id: true,
            name: true,
        }) satisfies Prisma.boardsSelect;

    export const selectSnapshots = <T extends Prisma.article_snapshotsSelect>(
        select: T,
    ) =>
        ({
            select,
            take: 1 as const,
            orderBy: { created_at: "desc" },
        }) satisfies Prisma.articles$snapshotsArgs;

    export const mapAuthor = (
        user: NonNullable<
            Awaited<
                ReturnType<
                    typeof prisma.users.findFirst<{
                        select: ReturnType<typeof selectAuthor>;
                    }>
                >
            >
        >,
    ): IArticle.IAuthor => {
        if (Entity.exist(user)) {
            const membership: IMembership | null = Entity.exist(user.membership)
                ? {
                      id: user.membership.id,
                      name: user.membership.name,
                      image_url: user.membership.image_url,
                      rank: user.membership.rank,
                  }
                : null;
            return {
                status: "active",
                id: user.id,
                name: user.name,
                image_url: user.image_url,
                membership,
            };
        }
        return { status: "deleted" };
    };
}
