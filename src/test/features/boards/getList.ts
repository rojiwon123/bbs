import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { APIValidator } from "@APP/test/internal/validator";
import { IBoard } from "@APP/types/IBoard";

export const test_get_board_list_successfully = (connection: IConnection) =>
    APIValidator.assert(
        api.functional.boards.getList(connection),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<
            IBoard.ISummary[] & typia.tags.MinItems<1>
        >(),
    });
