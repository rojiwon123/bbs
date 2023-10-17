/**

import { ArrayUtil } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";
import { IOauth } from "@APP/types/IOauth";

import { Util } from "../internal/utils";

export const test_authorization_success = (connection: IConnection) =>
    ArrayUtil.asyncForEach(["github", "kakao"] satisfies IOauth.Type[])(
        (oauth_type) =>
            api.functional.auth.oauth
                .authorize(connection, {
                    oauth_type,
                    code: "code",
                })
                .then(
                    Util.assertResposne({
                        status: HttpStatus.OK,
                        success: true,
                        assertBody: typia.createAssertEquals<IAuthentication>(),
                    }),
                ),
    );

export const test_oauth_authentication_fail = (connection: IConnection) =>
    ArrayUtil.asyncForEach(["github", "kakao"] satisfies IOauth.Type[])(
        (oauth_type) =>
            api.functional.auth.oauth
                .authorize(connection, {
                    oauth_type,
                    code: "test_fail",
                })
                .then(
                    Util.assertResposne({
                        status: HttpStatus.UNAUTHORIZED,
                        success: false,
                        assertBody:
                            typia.createAssertEquals<ErrorCode.Authentication>(),
                    }),
                ),
    );

*/
