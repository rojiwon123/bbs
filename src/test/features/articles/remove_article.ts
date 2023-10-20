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

const test = Util.assertResposne(api.functional.articles.remove);

const createBody = typia.createRandom<IArticle.ICreate>();

export const test_remove_article_successfully = async (
    connection: IConnection,
) => {
    // sign-in
    const auth = await Util.assertResposne(api.functional.auth.oauth.authorize)(
        connection,
        {
            oauth_type: "github",
            code: "testuser1",
        },
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    const permission = Util.addToken(auth.access_token.token)(connection);

    // create article
    const { article_id } = await Util.assertResposne(
        api.functional.articles.create,
    )(
        permission,
        createBody(),
    )({
        status: HttpStatus.CREATED,
        success: true,
        assertBody: typia.createAssertEquals<IArticle.Identity>(),
    });

    // remove article
    await test(
        permission,
        article_id,
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IArticle.Identity>(),
    });

    // check really removed
    await Util.assertResposne(api.functional.articles.get)(
        connection,
        article_id,
    )({
        status: HttpStatus.NOT_FOUND,
        success: false,
    });

    await Seed.deleteArticle(article_id);
};

export const test_remove_article_when_user_is_not_author = async (
    connection: IConnection,
) => {
    // sign-in
    const auth = await Util.assertResposne(api.functional.auth.oauth.authorize)(
        connection,
        {
            oauth_type: "github",
            code: "testuser1",
        },
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    const permission = Util.addToken(auth.access_token.token)(connection);

    const { data } = await Util.assertResposne(api.functional.articles.getList)(
        connection,
        {},
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article = data[0]!;

    // remove article
    await test(
        permission,
        article.id,
    )({
        status: HttpStatus.FORBIDDEN,
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });
};

export const test_remove_article_when_token_is_missing = async (
    connection: IConnection,
) => {
    const { data } = await Util.assertResposne(api.functional.articles.getList)(
        connection,
        {},
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article = data[0]!;

    // remove article
    await test(
        connection,
        article.id,
    )({
        status: HttpStatus.UNAUTHORIZED,
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });
};

export const test_remove_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    Mock.implement(DateMapper, "toISO", () => {
        const now = new Date();
        now.setFullYear(now.getFullYear() - 1);
        return now.toISOString();
    });

    // sign-in
    const auth = await Util.assertResposne(api.functional.auth.oauth.authorize)(
        connection,
        {
            oauth_type: "github",
            code: "testuser1",
        },
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    Mock.restore(DateMapper, "toISO");

    const permission = Util.addToken(auth.access_token.token)(connection);

    const { data } = await Util.assertResposne(api.functional.articles.getList)(
        connection,
        {},
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article = data[0]!;

    // remove article
    await test(
        permission,
        article.id,
    )({
        status: HttpStatus.UNAUTHORIZED,
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const test_remove_article_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const permission = Util.addToken("gmdfkgmdpk")(connection);

    const { data } = await Util.assertResposne(api.functional.articles.getList)(
        connection,
        {},
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article = data[0]!;

    // remove article
    await test(
        permission,
        article.id,
    )({
        status: HttpStatus.UNAUTHORIZED,
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_remove_article_when_user_id_is_invalid = async (
    connection: IConnection,
) => {
    // sign-in
    const auth = await Util.assertResposne(api.functional.auth.oauth.authorize)(
        connection,
        {
            oauth_type: "github",
            code: "testuser1",
        },
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    const permission = Util.addToken(auth.access_token.token)(connection);

    const { data } = await Util.assertResposne(api.functional.articles.getList)(
        connection,
        {},
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article = data[0]!;

    await prisma.users.updateMany({
        where: { name: "testuser1" },
        data: { deleted_at: DateMapper.toISO() },
    });

    // remove article
    await test(
        permission,
        article.id,
    )({
        status: HttpStatus.UNAUTHORIZED,
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });

    await prisma.users.updateMany({
        where: { name: "testuser1" },
        data: { deleted_at: null },
    });
};
