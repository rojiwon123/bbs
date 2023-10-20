import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Mock } from "@APP/test/internal/mock";
import { Seed } from "@APP/test/internal/seed";
import { Util } from "@APP/test/internal/utils";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { IAuthentication } from "@APP/types/IAuthentication";
import { DateMapper } from "@APP/utils/date";

const test = (connection: IConnection) =>
    api.functional.articles.create(
        connection,
        typia.random<IArticle.ICreate>(),
    );

export const test_create_article_successfully = async (
    connection: IConnection,
) => {
    // sign-in
    const {
        access_token: { token },
    } = await Util.assertResponse(
        api.functional.auth.oauth.authorize(connection, {
            oauth_type: "github",
            code: "testuser1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    // create article
    const { article_id } = await Util.assertResponse(
        test(Util.addToken(token)(connection)),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.Identity>(),
    });

    // check really created
    await Util.assertResponse(
        api.functional.articles.get(connection, article_id),
        HttpStatus.OK,
    )({ success: true, assertBody: typia.createAssertEquals<IArticle>() });

    // delete article
    await Seed.deleteArticle(article_id);
};

export const test_create_article_when_token_is_missing = (
    connection: IConnection,
) =>
    Util.assertResponse(
        test(connection),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });

export const test_create_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    // mocking for generating expired token
    Mock.implement(DateMapper, "toISO", () => {
        const now = new Date();
        now.setFullYear(now.getFullYear() - 1);
        return now.toISOString();
    });

    // sign-in
    const {
        access_token: { token },
    } = await Util.assertResponse(
        api.functional.auth.oauth.authorize(connection, {
            oauth_type: "github",
            code: "testuser1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    Mock.restore(DateMapper, "toISO");

    // create article
    await Util.assertResponse(
        test(Util.addToken(token)(connection)),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const test_create_article_when_token_is_invalid = (
    connection: IConnection,
) =>
    Util.assertResponse(
        test(Util.addToken("invalid1teown")(connection)),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });

export const test_create_article_when_user_id_is_invalid = async (
    connection: IConnection,
) => {
    // sign-in
    const {
        access_token: { token },
    } = await Util.assertResponse(
        api.functional.auth.oauth.authorize(connection, {
            oauth_type: "github",
            code: "testuser1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    await prisma.users.updateMany({
        where: { name: "testuser1" },
        data: { deleted_at: DateMapper.toISO() },
    });

    await Util.assertResponse(
        test(Util.addToken(token)(connection)),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });

    await prisma.users.updateMany({
        where: { name: "testuser1" },
        data: { deleted_at: null },
    });
};
