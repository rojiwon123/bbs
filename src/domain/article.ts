import { Prisma } from "@PRISMA";
import { isNull, map, pipe, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { IMembership } from "@APP/types/IMembership";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

export namespace Article {
    export const create =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: IArticle.ICreate,
        ): Promise<
            Result<
                IArticle.Identity,
                Failure.Internal<ErrorCode.Attachment.NotFound>
            >
        > => {
            const created_at = DateMapper.toISO();
            const article_id = Random.uuid();
            const attachment_ids = Array.from(new Set(input.attachment_ids));
            const attachment_count = await tx.attachments.count({
                where: { id: { in: attachment_ids } },
            });
            if (attachment_count !== attachment_ids.length)
                return Result.Error.map(
                    new Failure.Internal("NOT_FOUND_ATTACHMENT"),
                );

            await tx.articles.create({
                data: {
                    id: article_id,
                    board_id: input.board_id,
                    author_id: input.author_id,
                    notice: false,
                    created_at,
                    deleted_at: null,
                    snapshots: {
                        create: {
                            id: Random.uuid(),
                            title: input.title,
                            body_format: input.format,
                            body_url: input.url,
                            created_at,
                            article_attachment_snapshots: {
                                createMany: {
                                    data: attachment_ids.map(
                                        (attachment_id, sequence) => ({
                                            id: Random.uuid(),
                                            attachment_id,
                                            sequence,
                                        }),
                                    ),
                                },
                            },
                        },
                    },
                },
            });
            return Result.Ok.map<IArticle.Identity>({ article_id });
        };

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
                    notice: true,
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

            const snapshot = article.snapshots.at(0) ?? null;
            return Result.Ok.map<IArticle>({
                id: article.id,
                author: ArticleJson.mapAuthor(article.author),
                title: isNull(snapshot) ? null : snapshot.title,
                body: isNull(snapshot)
                    ? null
                    : { format: snapshot.body_format, url: snapshot.body_url },
                notice: article.notice,
                board: { id: article.board.id, name: article.board.name },
                attachments: [],
                created_at: DateMapper.toISO(article.created_at),
                updated_at: isNull(snapshot)
                    ? null
                    : article.created_at < snapshot.created_at
                      ? DateMapper.toISO(snapshot.created_at)
                      : null,
            });
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
                        select: ArticleJson.selectSummary(),
                    }),
                map(ArticleJson.mapSummary),
                toArray,
                Result.Ok.map,
            );

    export const getBulkList =
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
                        select: ArticleJson.selectBulk(),
                    }),
                map(ArticleJson.mapBulk),
                toArray,
                Result.Ok.map,
            );

    export const remove =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            identity: IArticle.Identity,
        ): Promise<Result.Ok<IArticle.Identity>> => {
            await tx.articles.updateMany({
                where: {
                    id: identity.article_id,
                    deleted_at: null,
                },
                data: { deleted_at: DateMapper.toISO() },
            });
            return Result.Ok.map({ article_id: identity.article_id });
        };

    export const update =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: IArticle.IUpdate,
        ): Promise<
            Result<
                IArticle.Identity,
                Failure.Internal<ErrorCode.Attachment.NotFound>
            >
        > => {
            const attachment_ids = Array.from(new Set(input.attachment_ids));
            const attachment_count = await tx.attachments.count({
                where: { id: { in: attachment_ids } },
            });
            if (attachment_count !== attachment_ids.length)
                return Result.Error.map(
                    new Failure.Internal("NOT_FOUND_ATTACHMENT"),
                );
            await tx.article_snapshots.create({
                data: {
                    id: Random.uuid(),
                    article_id: input.id,
                    title: input.title,
                    body_format: input.format,
                    body_url: input.url,
                    created_at: DateMapper.toISO(),
                    article_attachment_snapshots: {
                        createMany: {
                            data: attachment_ids.map(
                                (attachment_id, sequence) => ({
                                    id: Random.uuid(),
                                    attachment_id,
                                    sequence,
                                }),
                            ),
                        },
                    },
                },
            });
            return Result.Ok.map({ article_id: input.id });
        };

    export const setNotice =
        (tx: Prisma.TransactionClient = prisma) =>
        async ({
            board_id,
            article_ids,
            notice,
        }: IArticle.ISetNoticeInput): Promise<Result.Ok<number>> => {
            const { count } = await tx.articles.updateMany({
                where: {
                    id: { in: article_ids },
                    board_id,
                    deleted_at: null,
                },
                data: { notice },
            });
            return Result.Ok.map(count);
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

    export const selectSummary = () =>
        ({
            id: true,
            created_at: true,
            deleted_at: true,
            snapshots: selectSnapshots({
                title: true,
                created_at: true,
            }),
            author: { select: selectAuthor() },
        }) satisfies Prisma.articlesSelect;

    export const selectBulk = () =>
        ({
            id: true,
            created_at: true,
            deleted_at: true,
            snapshots: selectSnapshots({
                title: true,
                created_at: true,
            }),
            board: { select: selectBoard() },
        }) satisfies Prisma.articlesSelect;

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
        return { status: "deleted", id: user.id };
    };

    export const mapSummary = (
        article: NonNullable<
            Awaited<
                ReturnType<
                    typeof prisma.articles.findFirst<{
                        select: ReturnType<typeof selectSummary>;
                    }>
                >
            >
        >,
    ): IArticle.ISummary => {
        const snapshot = article.snapshots.at(0) ?? null;
        return {
            id: article.id,
            title: isNull(snapshot) ? null : snapshot.title,
            author: ArticleJson.mapAuthor(article.author),
            created_at: DateMapper.toISO(article.created_at),
            updated_at: isNull(snapshot)
                ? null
                : article.created_at < snapshot.created_at
                  ? DateMapper.toISO(snapshot.created_at)
                  : null,
        };
    };

    export const mapBulk = (
        article: NonNullable<
            Awaited<
                ReturnType<
                    typeof prisma.articles.findFirst<{
                        select: ReturnType<typeof selectBulk>;
                    }>
                >
            >
        >,
    ): IArticle.IBulk => {
        const snapshot = article.snapshots.at(0) ?? null;
        return {
            id: article.id,
            title: isNull(snapshot) ? null : snapshot.title,
            board: article.board,
            created_at: DateMapper.toISO(article.created_at),
            updated_at: isNull(snapshot)
                ? null
                : article.created_at < snapshot.created_at
                  ? DateMapper.toISO(snapshot.created_at)
                  : null,
        };
    };
}
