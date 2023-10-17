import { HttpStatus } from "@nestjs/common";
import api, { IConnection } from "@project/api";

import { Util } from "../internal/utils";

export const test_health_check = async (connection: IConnection) => {
    const response = await api.functional.health.check(connection);

    Util.assertResposne({
        status: HttpStatus.OK,
        success: true,
        assertBody: () => undefined,
    })(response);
};
