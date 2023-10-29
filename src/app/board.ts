import { isNull, negate } from "@fxts/core";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IBoard } from "@APP/types/IBoard";
import { Failure } from "@APP/utils/failure";
import { assertModule } from "@APP/utils/fx";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";

export interface Board {
    readonly get: (
        tx?: Prisma.TransactionClient,
    ) => (
        board_id: string & typia.tags.Format<"uuid">,
    ) => Promise<Result<IBoard, Failure.Internal<ErrorCode.Board.NotFound>>>;

    readonly getList: (
        tx?: Prisma.TransactionClient,
    ) => () => Promise<Result.Ok<IBoard.ISummary[]>>;
}
export namespace Board {
    export const get: Board["get"] =
        (tx = prisma) =>
        async (board_id) => {
            const board = await tx.boards.findFirst({
                where: { id: board_id },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    deleted_at: true,
                    manager_membership: {
                        select: {
                            id: true,
                            name: true,
                            image_url: true,
                            rank: true,
                        },
                    },
                    read_article_list_membership: {
                        select: {
                            id: true,
                            name: true,
                            image_url: true,
                            rank: true,
                        },
                    },
                    read_article_membership: {
                        select: {
                            id: true,
                            name: true,
                            image_url: true,
                            rank: true,
                        },
                    },
                    read_comment_list_membership: {
                        select: {
                            id: true,
                            name: true,
                            image_url: true,
                            rank: true,
                        },
                    },
                    write_article_membership: {
                        select: {
                            id: true,
                            name: true,
                            image_url: true,
                            rank: true,
                        },
                    },
                    write_comment_membership: {
                        select: {
                            id: true,
                            name: true,
                            image_url: true,
                            rank: true,
                        },
                    },
                },
            });
            if (isNull(board) || negate(isNull)(board.deleted_at))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Board.NotFound>(
                        "NOT_FOUND_BOARD",
                    ),
                );
            return Result.Ok.map(board);
        };

    export const getList: Board["getList"] =
        (tx = prisma) =>
        async () => {
            const boards = await tx.boards.findMany({
                select: { id: true, name: true, deleted_at: true },
            });
            return Result.Ok.map(
                boards.filter((board) => isNull(board.deleted_at)),
            );
        };
}

assertModule<Board>(Board);
