import { Request } from "express";

import { Authentication } from "@APP/domain/authentication";
import { Board } from "@APP/domain/board";
import { Comment } from "@APP/domain/comment";
import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { IBoard } from "@APP/types/IBoard";
import { IComment } from "@APP/types/IComment";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

export namespace BoardsArticlesCommentsUsecase {
    export const create =
        (req: Request) =>
        (identity: IBoard.Identity & IArticle.Identity) =>
        async (
            input: IComment.ICreateBody,
        ): Promise<
            Result<
                IComment.Identity,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Board.NotFound
                      | ErrorCode.Article.NotFound
                      | ErrorCode.Comment.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const permission = await Board.checkCreateCommentPermission(tx)(
                user,
                identity,
            );
            if (Result.Error.is(permission)) return permission;
            return Comment.create(tx)({
                ...input,
                author_id: user.id,
                article_id: identity.article_id,
            });
        };

    export const get =
        (req: Request) =>
        async (
            identity: IBoard.Identity & IArticle.Identity & IComment.Identity,
        ): Promise<
            Result<
                IComment,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Board.NotFound
                      | ErrorCode.Article.NotFound
                      | ErrorCode.Comment.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyOptionalUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const permission = await Board.checkReadCommentPermission(tx)(
                user,
                identity,
            );
            if (Result.Error.is(permission)) return permission;
            return Comment.get(tx)({ id: identity.comment_id });
        };
}