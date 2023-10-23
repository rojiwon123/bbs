import { isNull, negate } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { IComment } from "@APP/types/IComment";
import { IUser } from "@APP/types/IUser";
import { PrismaReturn } from "@APP/types/internal";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { assertModule, compare } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";
import { UserEntity } from "./user";

export interface Comment {
    readonly checkUpdatePermission: (
        tx?: Prisma.TransactionClient,
    ) => (
        requestor: IUser.Identity,
    ) => (
        identity: IArticle.Identity & IComment.Identity,
    ) => Promise<
        Result<
            null,
            Failure.Internal<
                ErrorCode.Permission.Insufficient | ErrorCode.Comment.NotFound
            >
        >
    >;
    readonly getList: (
        tx?: Prisma.TransactionClient,
    ) => (
        identity: IArticle.Identity,
    ) => (
        input: IComment.ISearch,
    ) => Promise<
        Result<
            IComment.IPaginatedResponse,
            Failure.Internal<ErrorCode.Article.NotFound>
        >
    >;

    readonly create: (
        tx?: Prisma.TransactionClient,
    ) => (
        requestor: IUser.Identity,
    ) => (
        identiy: IArticle.Identity,
    ) => (
        input: IComment.ICreate,
    ) => Promise<
        Result<IComment.Identity, Failure.Internal<ErrorCode.Article.NotFound>>
    >;

    readonly update: (
        tx?: Prisma.TransactionClient,
    ) => (
        requestor: IUser.Identity,
    ) => (
        identiy: IArticle.Identity & IComment.Identity,
    ) => (
        input: IComment.ICreate,
    ) => Promise<
        Result<
            IComment.Identity,
            Failure.Internal<
                ErrorCode.Permission.Insufficient | ErrorCode.Comment.NotFound
            >
        >
    >;
    readonly remove: (
        tx?: Prisma.TransactionClient,
    ) => (
        requestor: IUser.Identity,
    ) => (
        identiy: IArticle.Identity & IComment.Identity,
    ) => Promise<
        Result<
            IComment.Identity,
            Failure.Internal<
                ErrorCode.Permission.Insufficient | ErrorCode.Comment.NotFound
            >
        >
    >;
}
export namespace Comment {
    export const checkUpdatePermission: Comment["checkUpdatePermission"] =
        (tx = prisma) =>
        ({ user_id }) =>
        async ({ article_id, comment_id }) => {
            const comment = await tx.comments.findFirst({
                where: {
                    id: comment_id,
                    article_id,
                },
                select: { author_id: true, deleted_at: true },
            });
            if (isNull(comment) || negate(isNull)(comment.deleted_at))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Comment.NotFound>(
                        "NOT_FOUND_COMMENT",
                    ),
                );
            if (comment.author_id !== user_id)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Insufficient>(
                        "INSUFFICIENT_PERMISSION",
                    ),
                );
            return Result.Ok.map(null);
        };

    export const getList: Comment["getList"] =
        (tx = prisma) =>
        ({ article_id }) =>
        async ({ skip = 0, limit = 10 }) => {
            // 권한 구분이 생길때, article_id를 사용해서 권한체크 함
            const article = await tx.articles.findFirst({
                where: { id: article_id },
                select: { deleted_at: true },
            });
            if (isNull(article) || negate(isNull)(article.deleted_at))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            const comments = await tx.comments.findMany({
                where: { article_id },
                select: CommentEntity.select(),
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
            });
            const data = comments.map(CommentEntity.map);
            return Result.Ok.map({ data, skip, limit });
        };
    export const create: Comment["create"] =
        (tx = prisma) =>
        ({ user_id }) =>
        ({ article_id }) =>
        async (input) => {
            const article = await tx.articles.findFirst({
                where: { id: article_id },
                select: { deleted_at: true },
            });
            if (isNull(article) || negate(isNull)(article.deleted_at))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            const now = DateMapper.toISO();
            const comment_id = Random.uuid();
            await tx.comments.create({
                data: {
                    id: comment_id,
                    author_id: user_id,
                    article_id,
                    created_at: now,
                    snapshots: {
                        create: {
                            id: Random.uuid(),
                            body: input.body,
                            created_at: now,
                        },
                    },
                },
            });
            return Result.Ok.map({ comment_id });
        };
    export const update: Comment["update"] =
        (tx = prisma) =>
        (requestor) =>
        (identity) =>
        async (input) => {
            const permission =
                await checkUpdatePermission(tx)(requestor)(identity);
            if (Result.Error.is(permission)) return permission;
            await tx.comment_snapshots.create({
                data: {
                    id: Random.uuid(),
                    body: input.body,
                    comment_id: identity.comment_id,
                    created_at: DateMapper.toISO(),
                },
            });
            return Result.Ok.map({ comment_id: identity.comment_id });
        };
    export const remove: Comment["remove"] =
        (tx = prisma) =>
        (requestor) =>
        async (identity) => {
            const permission =
                await checkUpdatePermission(tx)(requestor)(identity);
            if (Result.Error.is(permission)) return permission;
            await tx.comments.updateMany({
                where: { id: identity.comment_id },
                data: { deleted_at: DateMapper.toISO() },
            });
            return Result.Ok.map({ comment_id: identity.comment_id });
        };
}

export namespace CommentEntity {
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
                    body: true,
                    created_at: true,
                },
            },
        }) satisfies Prisma.commentsSelect;
    export const map = (
        input: PrismaReturn<
            typeof prisma.comments.findFirst<{
                select: ReturnType<typeof select>;
            }>
        >,
    ): IComment => ({
        id: input.id,
        author: isNull(input.author.deleted_at)
            ? { status: "deleted" }
            : UserEntity.mapAuthor(input.author),
        snapshots: input.snapshots
            .sort(compare("desc")((a) => a.created_at.getTime()))
            .map((snapshot) => ({
                body: snapshot.body,
                created_at: DateMapper.toISO(snapshot.created_at),
            })),
        created_at: DateMapper.toISO(input.created_at),
    });
}

assertModule<Comment>(Comment);
