import { TestValidator } from "@nestia/e2e";
import { HttpStatus } from "@nestjs/common";
import api, { IConnection } from "@project/api";
import typia from "typia";

import { Connection } from "@APP/test/internal/connection";
import { get_expired_token, get_token } from "@APP/test/internal/fragment";
import { Seed } from "@APP/test/internal/seed";
import { APIValidator } from "@APP/test/internal/validator";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { pick } from "@APP/utils/map";

const test = api.functional.mine.articles.getList;

export const test_get_mine_article_list_successfully = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user3");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: APIValidator.assertNotEmpty(
            typia.createAssertEquals<IArticle.IBulk.IPaginated>(),
        ),
    });
};

export const test_get_mine_article_list_with_query = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user3");
    const page1 = await APIValidator.assert(
        test(Connection.authorize(token)(connection), {
            size: 10,
            page: 1,
            sort: "latest",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: APIValidator.assertNotEmpty(
            typia.createAssertEquals<IArticle.IBulk.IPaginated>(),
        ),
    });
    const page2 = await APIValidator.assert(
        test(Connection.authorize(token)(connection), {
            size: 10,
            page: 2,
            sort: "latest",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: APIValidator.assertNotEmpty(
            typia.createAssertEquals<IArticle.IBulk.IPaginated>(),
        ),
    });
    const total = await APIValidator.assert(
        test(Connection.authorize(token)(connection), {
            size: 100,
            page: 1,
            sort: "oldest",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: APIValidator.assertNotEmpty(
            typia.createAssertEquals<IArticle.IBulk.IPaginated>(),
        ),
    });

    const board_articles = await APIValidator.assert(
        test(Connection.authorize(token)(connection), {
            size: 100,
            page: 1,
            sort: "oldest",
            board_id: await Seed.getBoardId("board3"),
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: APIValidator.assertNotEmpty(
            typia.createAssertEquals<IArticle.IBulk.IPaginated>(),
        ),
    });

    typia.assertEquals<"board3"[]>(
        board_articles.data.map(pick("board")).map(pick("name")),
    );

    const ids = page1.data
        .map(pick("id"))
        .concat(...page2.data.map(pick("id")));
    const actual = total.data.map(pick("id")).reverse().slice(0, ids.length);
    TestValidator.equals("query test")(ids)(actual);
};

export const test_remove_article_when_token_is_missing = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(connection, {}),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });
};

export const test_get_mine_article_list_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "user2");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), {}),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const test_get_mine_article_list_when_token_is_invalid = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(Connection.authorize("invalid)adtoken")(connection), {}),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_get_mine_article_list_when_user_is_invalid = async (
    connection: IConnection,
) => {
    const username = "get_mine_article_list_test";
    await Seed.createUser(username, null);
    const token = await get_token(connection, username);
    await Seed.deleteUser(username);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), {}),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};
