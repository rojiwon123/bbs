import { RandomGenerator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Seed } from "@APP/test/internal/seed";
import { APIValidator } from "@APP/test/internal/validator";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";

const test = api.functional.auth.oauth.sign_in.signInByOauth;

export const test_sign_in_by_oauth_successfully = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(connection, {
            oauth_type: RandomGenerator.pick(["github", "kakao"]),
            code: "user1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });
};

export const test_sign_in_by_oauth_when_fail_to_oauth = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(connection, {
            oauth_type: RandomGenerator.pick(["github", "kakao"]),
            code: "test_fail",
        }),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Authentication>(),
    });
};

export const test_sign_in_by_oauth_when_user_does_not_exist = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(connection, {
            oauth_type: RandomGenerator.pick(["github", "kakao"]),
            code: "not exist",
        }),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.User.NotFound>(),
    });
};

export const test_seed_changed = Seed.check_size_changed;
