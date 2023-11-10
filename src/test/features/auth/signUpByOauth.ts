import { ArrayUtil, RandomGenerator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Seed } from "@APP/test/internal/seed";
import { APIValidator } from "@APP/test/internal/validator";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";

const test = api.functional.auth.oauth.sign_up.signUpByOauth;

export const test_sign_up_when_first_visitor = async (
    connection: IConnection,
) =>
    ArrayUtil.asyncForEach(["github", "kakao"] as const)(async (oauth_type) => {
        await APIValidator.assert(
            test(connection, {
                oauth_type,
                code: "sign_up_test",
            }),
            HttpStatus.CREATED,
        )({
            success: true,
            assertBody: typia.createAssertEquals<IAuthentication>(),
        });
        await Seed.deleteUser("sign_up_test");
    });

export const test_sign_up_when_already_exist = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(connection, {
            oauth_type: RandomGenerator.pick(["github", "kakao"]),
            code: "user1",
        }),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });
};

export const test_sign_up_when_when_fail_to_oauth = async (
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

export const test_seed_changed = Seed.check_size_changed;
