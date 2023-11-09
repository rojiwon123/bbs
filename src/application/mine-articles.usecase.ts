import { Request } from "express";

import { Article } from "@APP/domain/article";
import { Authentication } from "@APP/domain/authentication";
import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Result } from "@APP/utils/result";

export namespace MineArticlesUsecase {
    export const get =
        (req: Request) =>
        async (
            identity: IArticle.Identity,
        ): Promise<
            Result<
                IArticle,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Article.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const result = await Article.get(tx)({
                id: identity.article_id,
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
            board_id,
        }: IArticle.IBulk.ISearch): Promise<
            Result<
                IArticle.IBulk.IPaginated,
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
                (data: IArticle.IBulk[]): IArticle.IBulk.IPaginated => ({
                    data,
                    page,
                    size,
                }),
            )(
                await Article.getBulkList(tx)({
                    where: {
                        author_id: user.id,
                        ...(board_id ? { board_id } : {}),
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
            identity: IArticle.Identity,
        ): Promise<
            Result<
                IArticle.Identity,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Article.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const article = await tx.articles.findFirst({
                where: { id: identity.article_id },
                select: { author_id: true, deleted_at: true },
            });
            if (!Entity.exist(article))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            if (user.id !== article.author_id)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Insufficient>(
                        "INSUFFICIENT_PERMISSION",
                    ),
                );

            return Article.remove(tx)(identity);
        };

    export const update =
        (req: Request) =>
        (identity: IArticle.Identity) =>
        async (
            input: IArticle.IUpdateBody,
        ): Promise<
            Result<
                IArticle.Identity,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                      | ErrorCode.Article.NotFound
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);
            const article = await tx.articles.findFirst({
                where: { id: identity.article_id },
                select: { author_id: true, deleted_at: true },
            });
            if (!Entity.exist(article))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            if (user.id !== article.author_id)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Insufficient>(
                        "INSUFFICIENT_PERMISSION",
                    ),
                );
            return Article.update(tx)({ ...input, id: identity.article_id });
        };
}
