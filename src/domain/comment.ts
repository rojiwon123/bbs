import { isNull, map, pipe, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";
import { ArticleJson } from "./article";

export namespace Comment {
    export const create =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: IComment.ICreate,
        ): Promise<Result.Ok<IComment.Identity>> => {
            const created_at = DateMapper.toISO();
            const comment_id = Random.uuid();
            await tx.comments.create({
                data: {
                    id: comment_id,
                    author_id: input.author_id,
                    article_id: input.article_id,
                    parent_id: input.parent_id,
                    created_at,
                    deleted_at: null,
                    snapshots: {
                        create: {
                            id: Random.uuid(),
                            body: input.body,
                            created_at,
                        },
                    },
                },
            });
            return Result.Ok.map({ comment_id });
        };

    export const get =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: Prisma.commentsWhereInput,
        ): Promise<
            Result<IComment, Failure.Internal<ErrorCode.Comment.NotFound>>
        > => {
            const comment = await tx.comments.findFirst({
                where: input,
                select: {
                    id: true,
                    created_at: true,
                    deleted_at: true,
                    author: { select: ArticleJson.selectAuthor() },
                    snapshots: CommentJson.selectSnapshots({
                        body: true,
                        created_at: true,
                    }),
                    article: { select: ArticleJson.selectSummary() },
                    parent: {
                        select: CommentJson.selectSummary(),
                    },
                },
            });
            if (!Entity.exist(comment))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Comment.NotFound>(
                        "NOT_FOUND_COMMENT",
                    ),
                );
            const snapshot = comment.snapshots.at(0) ?? null;
            return Result.Ok.map<IComment>({
                id: comment.id,
                author: ArticleJson.mapAuthor(comment.author),
                body: snapshot?.body ?? null,
                parent: isNull(comment.parent)
                    ? null
                    : CommentJson.mapSummary(comment.parent),
                article: ArticleJson.mapSummary(comment.article),
                created_at: DateMapper.toISO(comment.created_at),
                updated_at: isNull(snapshot)
                    ? null
                    : comment.created_at < snapshot.created_at
                    ? DateMapper.toISO(snapshot.created_at)
                    : null,
            });
        };

    export const getList =
        (tx: Prisma.TransactionClient = prisma) =>
        async (input: {
            where?: Prisma.commentsWhereInput;
            skip: number;
            take: number;
            orderBy: Prisma.commentsOrderByWithRelationInput;
        }) =>
            pipe(
                input,
                async ({ where = {}, skip, take, orderBy }) =>
                    tx.comments.findMany({
                        where: { ...where, deleted_at: null },
                        skip,
                        take,
                        orderBy,
                        select: CommentJson.selectSummary(),
                    }),
                map(CommentJson.mapSummary),
                toArray,
                Result.Ok.map,
            );

    export const getBulkList =
        (tx: Prisma.TransactionClient = prisma) =>
        async (input: {
            where?: Prisma.commentsWhereInput;
            skip: number;
            take: number;
            orderBy: Prisma.commentsOrderByWithRelationInput;
        }) =>
            pipe(
                input,
                async ({ where = {}, skip, take, orderBy }) =>
                    tx.comments.findMany({
                        where: { ...where, deleted_at: null },
                        skip,
                        take,
                        orderBy,
                        select: CommentJson.selectBulk(),
                    }),
                map(CommentJson.mapBulk),
                toArray,
                Result.Ok.map,
            );

    export const remove =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            identity: IComment.Identity,
        ): Promise<Result.Ok<IComment.Identity>> => {
            await tx.comments.updateMany({
                where: {
                    id: identity.comment_id,
                    deleted_at: null,
                },
                data: { deleted_at: DateMapper.toISO() },
            });
            return Result.Ok.map({ comment_id: identity.comment_id });
        };

    export const update =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: IComment.IUpdate,
        ): Promise<Result.Ok<IComment.Identity>> => {
            await tx.comment_snapshots.create({
                data: {
                    id: Random.uuid(),
                    body: input.body,
                    comment_id: input.id,
                    created_at: DateMapper.toISO(),
                },
            });
            return Result.Ok.map({ comment_id: input.id });
        };
}

export namespace CommentJson {
    export const selectSnapshots = <T extends Prisma.comment_snapshotsSelect>(
        select: T,
    ) =>
        ({
            select,
            take: 1 as const,
            orderBy: { created_at: "desc" },
        }) satisfies Prisma.comments$snapshotsArgs;
    export const selectSummary = () =>
        ({
            id: true,
            created_at: true,
            deleted_at: true,
            snapshots: selectSnapshots({
                body: true,
                created_at: true,
            }),
            author: { select: ArticleJson.selectAuthor() },
        }) satisfies Prisma.commentsSelect;

    export const selectBulk = () =>
        ({
            id: true,
            created_at: true,
            deleted_at: true,
            snapshots: selectSnapshots({ body: true, created_at: true }),
            article: { select: ArticleJson.selectSummary() },
            parent: { select: selectSummary() },
        }) satisfies Prisma.commentsSelect;

    export const mapSummary = (
        comment: NonNullable<
            Awaited<
                ReturnType<
                    typeof prisma.comments.findFirst<{
                        select: ReturnType<typeof selectSummary>;
                    }>
                >
            >
        >,
    ): IComment.ISummary => {
        const snapshot = comment.snapshots.at(0) ?? null;
        return {
            id: comment.id,
            body: snapshot?.body ?? null,
            author: ArticleJson.mapAuthor(comment.author),
            created_at: DateMapper.toISO(comment.created_at),
            updated_at: isNull(snapshot)
                ? null
                : comment.created_at < snapshot.created_at
                ? DateMapper.toISO(snapshot.created_at)
                : null,
        };
    };

    export const mapBulk = (
        comments: NonNullable<
            Awaited<
                ReturnType<
                    typeof prisma.comments.findFirst<{
                        select: ReturnType<typeof selectBulk>;
                    }>
                >
            >
        >,
    ): IComment.IBulk => {
        const snapshot = comments.snapshots.at(0) ?? null;
        return {
            id: comments.id,
            body: isNull(snapshot) ? null : snapshot.body,
            article: ArticleJson.mapSummary(comments.article),
            parent: isNull(comments.parent)
                ? null
                : mapSummary(comments.parent),
            created_at: DateMapper.toISO(comments.created_at),
            updated_at: isNull(snapshot)
                ? null
                : comments.created_at < snapshot.created_at
                ? DateMapper.toISO(snapshot.created_at)
                : null,
        };
    };
}
