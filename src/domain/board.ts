import { filter, isNull, map, pipe, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { IBoard } from "@APP/types/IBoard";
import { IComment } from "@APP/types/IComment";
import { IUser } from "@APP/types/IUser";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";
import { Membership } from "./membership";

export namespace Board {
    const check =
        (
            action:
                | "read_article_list_membership"
                | "read_article_membership"
                | "write_article_membership"
                | "read_comment_list_membership"
                | "write_comment_membership"
                | "manager_membership",
        ) =>
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            actor: IUser | null,
            target: IBoard.Identity,
        ): Promise<
            Result<
                null,
                Failure.Internal<
                    ErrorCode.Board.NotFound | ErrorCode.Permission.Insufficient
                >
            >
        > => {
            const board = await tx.boards.findFirst({
                where: { id: target.board_id },
                select: {
                    id: true,
                    deleted_at: true,
                    read_article_list_membership:
                        action === "read_article_list_membership",
                    read_article_membership:
                        action === "read_article_membership",
                    read_comment_list_membership:
                        action === "read_comment_list_membership",
                    write_article_membership:
                        action === "write_article_membership",
                    write_comment_membership:
                        action === "write_comment_membership",
                    manager_membership: action === "manager_membership",
                },
            });

            if (!Entity.exist(board))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Board.NotFound>(
                        "NOT_FOUND_BOARD",
                    ),
                );
            const permission = Membership.compare(
                actor?.membership ?? null,
                board[action],
            );
            if (Result.Error.is(permission)) return permission;
            return Result.Ok.map(null);
        };

    export const checkReadArticleListPermission = check(
        "read_article_list_membership",
    );

    export const checkReadArticlePermission = check("read_article_membership");

    export const checkReadCommentListPermission =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            actor: IUser | null,
            target: IBoard.Identity & IArticle.Identity,
        ): Promise<
            Result<
                null,
                Failure.Internal<
                    | ErrorCode.Permission.Insufficient
                    | ErrorCode.Board.NotFound
                    | ErrorCode.Article.NotFound
                >
            >
        > => {
            const permission = await check("read_comment_list_membership")(tx)(
                actor,
                target,
            );
            if (Result.Error.is(permission)) return permission;
            const article = await tx.articles.findFirst({
                where: {
                    id: target.article_id,
                    board_id: target.board_id,
                },
                select: {
                    deleted_at: true,
                },
            });
            if (!Entity.exist(article))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            return Result.Ok.map(null);
        };

    export const checkCreateArticlePermission = check(
        "write_article_membership",
    );

    export const checkCreateCommentPermission =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            actor: IUser | null,
            target: IBoard.Identity & IArticle.Identity,
            parent: IComment.Identity | null = null,
        ): Promise<
            Result<
                null,
                Failure.Internal<
                    | ErrorCode.Permission.Insufficient
                    | ErrorCode.Board.NotFound
                    | ErrorCode.Article.NotFound
                    | ErrorCode.Comment.NotFound
                >
            >
        > => {
            const permission = await check("write_comment_membership")(tx)(
                actor,
                target,
            );
            if (Result.Error.is(permission)) return permission;
            const article = await tx.articles.findFirst({
                where: {
                    id: target.article_id,
                    board_id: target.board_id,
                },
                select: {
                    deleted_at: true,
                },
            });
            if (!Entity.exist(article))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Article.NotFound>(
                        "NOT_FOUND_ARTICLE",
                    ),
                );
            if (!isNull(parent)) {
                const comment = await tx.comments.findFirst({
                    where: {
                        id: parent.comment_id,
                        article_id: target.article_id,
                    },
                    select: { deleted_at: true },
                });
                if (!Entity.exist(comment))
                    return Result.Error.map(
                        new Failure.Internal<ErrorCode.Comment.NotFound>(
                            "NOT_FOUND_COMMENT",
                        ),
                    );
            }
            return Result.Ok.map(null);
        };

    export const checkManagerPermission = check("manager_membership");

    export const get =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: Prisma.boardsWhereInput,
        ): Promise<
            Result<IBoard, Failure.Internal<ErrorCode.Board.NotFound>>
        > => {
            const membership_select = {
                id: true,
                name: true,
                image_url: true,
                rank: true,
            };
            const board = await tx.boards.findFirst({
                where: input,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    deleted_at: true,
                    manager_membership: {
                        select: membership_select,
                    },
                    read_article_list_membership: {
                        select: membership_select,
                    },
                    read_article_membership: {
                        select: membership_select,
                    },
                    read_comment_list_membership: {
                        select: membership_select,
                    },
                    write_article_membership: {
                        select: membership_select,
                    },
                    write_comment_membership: {
                        select: membership_select,
                    },
                },
            });
            if (Entity.exist(board))
                return Result.Ok.map<IBoard>({
                    id: board.id,
                    name: board.name,
                    description: board.description,
                    read_article_list_membership:
                        board.read_article_list_membership,
                    read_article_membership: board.read_article_membership,
                    read_comment_list_membership:
                        board.read_comment_list_membership,
                    write_article_membership: board.write_article_membership,
                    write_comment_membership: board.write_comment_membership,
                    manager_membership: board.manager_membership,
                });
            return Result.Error.map(
                new Failure.Internal<ErrorCode.Board.NotFound>(
                    "NOT_FOUND_BOARD",
                ),
            );
        };

    export const getList =
        (tx: Prisma.TransactionClient = prisma) =>
        (input: Prisma.boardsWhereInput = {}) =>
            pipe(
                input,
                async (where) =>
                    tx.boards.findMany({
                        where,
                        select: { id: true, name: true, deleted_at: true },
                    }),
                filter(Entity.exist),
                map(({ id, name }): IBoard.ISummary => ({ id, name })),
                toArray,
                Result.Ok.map,
            );
}
