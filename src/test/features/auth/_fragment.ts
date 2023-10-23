import { isNull } from "@fxts/core";
import { RandomGenerator } from "@nestia/e2e";
import { IConnection, IPropagation } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Mock } from "@APP/test/internal/mock";
import { Util } from "@APP/test/internal/utils";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";
import { DateMapper } from "@APP/utils/date";

export const get_token = async (connection: IConnection, code: string) => {
    const {
        access_token: { token },
    } = await Util.assertResponse(
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
    Mock.implement(DateMapper, "toISO", () => iso);

    const token = await get_token(connection, code);

    Mock.restore(DateMapper, "toISO");

    return token;
};

export const check_permission_expired = async (
    response: Promise<
        | IPropagation.IBranch<boolean, unknown, any>
        | IPropagation.IBranch<false, HttpStatus.UNAUTHORIZED, unknown>
    >,
) =>
    Util.assertResponse(
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
    Util.assertResponse(
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
    Util.assertResponse(
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
    Util.assertResponse(
        response,
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });

export const remove_user = async (username: string) => {
    const user = await prisma.users.findFirst({
        where: { name: username, deleted_at: null },
    });
    if (isNull(user)) throw Error("user not found");
    await prisma.users.update({
        where: { id: user.id },
        data: { deleted_at: DateMapper.toISO() },
    });
    return { user_id: user.id };
};

export const restore_remove_user = async (user_id: string) => {
    await prisma.users.update({
        where: { id: user_id },
        data: { deleted_at: null },
    });
};
