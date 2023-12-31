import { Request } from "express";

import { Article } from "@APP/domain/article";
import { Authentication } from "@APP/domain/authentication";
import { Board } from "@APP/domain/board";
import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { IBoard } from "@APP/types/IBoard";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

export namespace BoardsArticlesUsecase {
    export const create =
        (req: Request) =>
        (identity: IBoard.Identity) =>
        async (
            body: IArticle.ICreateBody,
        ): Promise<
            Result<
                IArticle.Identity,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Board.NotFound
                      | ErrorCode.Attachment.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const permission = await Board.checkCreateArticlePermission(tx)(
                user,
                identity,
            );
            if (Result.Error.is(permission)) return permission;
            return Article.create(tx)({
                ...body,
                author_id: user.id,
                board_id: identity.board_id,
                notice: false,
            });
        };

    export const get =
        (req: Request) =>
        async (
            identity: IBoard.Identity & IArticle.Identity,
        ): Promise<
            Result<
                IArticle,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Board.NotFound
                      | ErrorCode.Article.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyOptionalUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const permission = await Board.checkReadArticlePermission(tx)(
                user,
                identity,
            );
            if (Result.Error.is(permission)) return permission;
            return Article.get(tx)({
                id: identity.article_id,
                board_id: identity.board_id,
            });
        };

    export const getList =
        (req: Request) =>
        (identity: IBoard.Identity) =>
        async ({
            sort = "latest",
            page = 1,
            size = 10,
        }: IArticle.ISearch): Promise<
            Result<
                IArticle.IPaginated,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Board.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyOptionalUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const permission = await Board.checkReadArticleListPermission(tx)(
                user,
                identity,
            );
            if (Result.Error.is(permission)) return permission;
            return Result.Ok.lift(
                (data: IArticle.ISummary[]): IArticle.IPaginated => ({
                    data,
                    page,
                    size,
                }),
            )(
                await Article.getList(tx)({
                    where: { board_id: identity.board_id },
                    skip: (page - 1) * size,
                    take: size,
                    orderBy: { created_at: sort === "latest" ? "desc" : "asc" },
                }),
            );
        };
}
