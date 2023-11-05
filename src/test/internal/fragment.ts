import { RandomGenerator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Mocker } from "@APP/test/internal/mocker";
import { APIValidator } from "@APP/test/internal/validator";
import { IAuthentication } from "@APP/types/IAuthentication";
import { DateMapper } from "@APP/utils/date";

export const get_token = async (connection: IConnection, code: string) => {
    const {
        access_token: { token },
    } = await APIValidator.assert(
        api.functional.auth.oauth.sign_in.signInByOauth(connection, {
            oauth_type: RandomGenerator.pick(["github", "kakao"]),
            code,
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });
    return token;
};

export const get_expired_token = async (
    connection: IConnection,
    code: string,
) => {
    const now = new Date();
    now.setFullYear(now.getFullYear() - 1);
    const iso = now.toISOString();
    Mocker.implement(DateMapper, "toISO", () => iso);

    const token = await get_token(connection, code);

    Mocker.restore(DateMapper, "toISO");

    return token;
};
