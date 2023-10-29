import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { check_seed_changed } from "@APP/test/internal/fragment";
import { Seed } from "@APP/test/internal/seed";
import { APIValidator } from "@APP/test/internal/validator";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IBoard } from "@APP/types/IBoard";
import { Random } from "@APP/utils/random";

const test = api.functional.boards.get;

export const test_get_board_successfully = async (connection: IConnection) =>
    APIValidator.assert(
        test(connection, await Seed.getBoardId("board1")),
        HttpStatus.OK,
    )({ success: true, assertBody: typia.createAssertEquals<IBoard>() });

export const test_get_board_when_does_not_exist = (connection: IConnection) =>
    APIValidator.assert(
        test(connection, Random.uuid()),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Board.NotFound>(),
    });

export const test_get_board_when_board_is_deleted = async (
    connection: IConnection,
) =>
    APIValidator.assert(
        test(connection, await Seed.getBoardId("deleted")),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Board.NotFound>(),
    });

export const test_seed_changed = check_seed_changed;
