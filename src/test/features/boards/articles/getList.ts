import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import assert from "assert";
import typia from "typia";

import { Connection } from "@APP/test/internal/connection";
import { get_expired_token, get_token } from "@APP/test/internal/fragment";
import { Seed } from "@APP/test/internal/seed";
import { APIValidator } from "@APP/test/internal/validator";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { Random } from "@APP/utils/random";

const test = api.functional.boards.articles.getList;

export const test_get_article_list_when_board_is_public_and_request_is_unauthorized =
    async (connection: IConnection) => {
        const board_id = await Seed.getBoardId("board1");
        await APIValidator.assert(
            test(connection, board_id, {}),
            HttpStatus.OK,
        )({
            success: true,
            assertBody: APIValidator.assertNotEmpty(
                typia.createAssertEquals<IArticle.IPaginated>(),
            ),
        });
    };

export const test_get_article_list_with_query = async (
    connection: IConnection,
) => {
    const board_id = await Seed.getBoardId("board1");
    const expected = await APIValidator.assert(
        test(connection, board_id, { size: 10, page: 1, sort: "oldest" }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: APIValidator.assertNotEmpty(
            typia.createAssertEquals<IArticle.IPaginated>(),
        ),
    });

    const actual = await APIValidator.assert(
        test(connection, board_id, { size: 10, page: 2, sort: "oldest" }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: APIValidator.assertNotEmpty(
            typia.createAssertEquals<IArticle.IPaginated>(),
        ),
    });

    const actual_latest = await APIValidator.assert(
        test(connection, board_id, { size: 100, page: 1, sort: "latest" }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: APIValidator.assertNotEmpty(
            typia.createAssertEquals<IArticle.IPaginated>(),
        ),
    });
    const size = new Set(
        expected.data.concat(...actual.data).map((article) => article.id),
    ).size;

    assert.deepStrictEqual(size, expected.data.length + actual.data.length);
    assert.deepStrictEqual(
        actual_latest.data.reverse().slice(10, 10 + actual.data.length),
        actual.data,
    );
};

export const test_get_article_list_when_board_is_private_and_request_is_unauthorized =
    async (connection: IConnection) => {
        const board_id = await Seed.getBoardId("board2");
        await APIValidator.assert(
            test(connection, board_id, {}),
            HttpStatus.FORBIDDEN,
        )({
            success: false,
            assertBody:
                typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
        });
    };

export const test_get_article_list_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "user2");
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id, {}),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};
export const test_get_article_list_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(Connection.authorize("invalid)adtoken")(connection), board_id, {}),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};
export const test_get_article_list_when_user_is_invalid = async (
    connection: IConnection,
) => {
    const username = "create_article_test";
    await Seed.createUser(username, null);
    const token = await get_token(connection, username);
    await Seed.deleteUser(username);
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id, {}),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};
export const test_get_article_list_when_board_does_not_exist = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user1");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), Random.uuid(), {}),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Board.NotFound>(),
    });
};
export const test_get_article_list_when_membership_is_insufficient = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user0");
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id, {}),
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });
};
