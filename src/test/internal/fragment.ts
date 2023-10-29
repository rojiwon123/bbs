import { RandomGenerator } from "@nestia/e2e";
import { IConnection, IPropagation } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Mocker } from "@APP/test/internal/mocker";
import { APIValidator } from "@APP/test/internal/validator";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";
import { DateMapper } from "@APP/utils/date";

import { Seed } from "./seed";

export const get_token = async (connection: IConnection, code: string) => {
    const {
        access_token: { token },
    } = await APIValidator.assert(
        api.functional.auth.oauth.authorize(connection, {
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

export const check_permission_expired = async (
    response: Promise<
        | IPropagation.IBranch<boolean, unknown, any>
        | IPropagation.IBranch<false, HttpStatus.UNAUTHORIZED, unknown>
    >,
) =>
    APIValidator.assert(
        response,
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });

export const check_permission_required = (
    response: Promise<
        | IPropagation.IBranch<boolean, unknown, any>
        | IPropagation.IBranch<false, HttpStatus.UNAUTHORIZED, unknown>
    >,
) =>
    APIValidator.assert(
        response,
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });

export const check_permission_invalid = (
    response: Promise<
        | IPropagation.IBranch<boolean, unknown, any>
        | IPropagation.IBranch<false, HttpStatus.UNAUTHORIZED, unknown>
    >,
) =>
    APIValidator.assert(
        response,
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });

export const check_permission_insufficient = (
    response: Promise<
        | IPropagation.IBranch<boolean, unknown, any>
        | IPropagation.IBranch<false, HttpStatus.FORBIDDEN, unknown>
    >,
) =>
    APIValidator.assert(
        response,
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });

export const check_seed_changed = async () => (await Seed.size.check())();
