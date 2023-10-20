import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";

import { Util } from "../internal/utils";

export const test_health_check = (connection: IConnection) =>
    Util.assertResponse(
        api.functional.health.check(connection),
        HttpStatus.OK,
    )({
        success: true,
    });
