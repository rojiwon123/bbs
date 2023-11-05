import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { APIValidator } from "../internal/validator";

export const test_health_check = (connection: IConnection) =>
    APIValidator.assert(
        api.functional.health.check(connection),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<"hello world">(),
    });
