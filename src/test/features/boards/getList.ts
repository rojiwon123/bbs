import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { check_seed_changed } from "@APP/test/internal/fragment";
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

export const test_seed_changed = check_seed_changed;
