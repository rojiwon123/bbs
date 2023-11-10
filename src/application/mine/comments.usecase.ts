import { Request } from "express";

import { Authentication } from "@APP/domain/authentication";
import { Comment } from "@APP/domain/comment";
import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Result } from "@APP/utils/result";

export namespace MineCommentsUsecase {
    export const get =
        (req: Request) =>
        async (
            identity: IComment.Identity,
        ): Promise<
            Result<
                IComment,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Comment.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const result = await Comment.get(tx)({
                id: identity.comment_id,
            });
            if (
                Result.Ok.is(result) &&
                user.id !== Result.Ok.flatten(result).author.id
            )
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Insufficient>(
                        "INSUFFICIENT_PERMISSION",
                    ),
                );
            return result;
        };

    export const getList =
        (req: Request) =>
        async ({
            page = 1,
            size = 10,
            sort = "latest",
            article_id,
            parent_id,
        }: IComment.IBulk.ISearch): Promise<
            Result<
                IComment.IBulk.IPaginated,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            return Result.Ok.lift(
                (data: IComment.IBulk[]): IComment.IBulk.IPaginated => ({
                    data,
                    page,
                    size,
                }),
            )(
                await Comment.getBulkList(tx)({
                    where: {
                        author_id: user.id,
                        parent_id: parent_id ?? null,
                        ...(article_id ? { article_id } : {}),
                    },
                    skip: (page - 1) * size,
                    take: size,
                    orderBy: { created_at: sort === "latest" ? "desc" : "asc" },
                }),
            );
        };

    export const remove =
        (req: Request) =>
        async (
            identity: IComment.Identity,
        ): Promise<
            Result<
                IComment.Identity,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Comment.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const comment = await tx.comments.findFirst({
                where: { id: identity.comment_id },
                select: { author_id: true, deleted_at: true },
            });
            if (!Entity.exist(comment))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Comment.NotFound>(
                        "NOT_FOUND_COMMENT",
                    ),
                );
            if (user.id !== comment.author_id)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Insufficient>(
                        "INSUFFICIENT_PERMISSION",
                    ),
                );

            return Comment.remove(tx)(identity);
        };

    export const update =
        (req: Request) =>
        (identity: IComment.Identity) =>
        async (
            input: IComment.IUpdateBody,
        ): Promise<
            Result<
                IComment.Identity,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Comment.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const comment = await tx.comments.findFirst({
                where: { id: identity.comment_id },
                select: { author_id: true, deleted_at: true },
            });
            if (!Entity.exist(comment))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Comment.NotFound>(
                        "NOT_FOUND_COMMENT",
                    ),
                );
            if (user.id !== comment.author_id)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Insufficient>(
                        "INSUFFICIENT_PERMISSION",
                    ),
                );
            return Comment.update(tx)({ ...input, id: identity.comment_id });
        };
}
