import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Util } from "../internal/utils";

export const health_check = (connection: IConnection) =>
    Util.assertResponse(
        api.functional.health.check(connection),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<"hello world">(),
    });
