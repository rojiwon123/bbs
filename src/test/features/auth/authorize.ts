import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IAuthentication } from "@APP/types/IAuthentication";

export const authorize_successfully = (connection: IConnection) =>
    Util.assertResponse(
        api.functional.auth.oauth.authorize(connection, {
            oauth_type: "github",
            code: "testuser1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });
