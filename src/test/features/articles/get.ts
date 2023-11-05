import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Connection } from "@APP/test/internal/connection";
import { get_expired_token, get_token } from "@APP/test/internal/fragment";
import { Seed } from "@APP/test/internal/seed";
import { APIValidator } from "@APP/test/internal/validator";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { Random } from "@APP/utils/random";

const test = api.functional.boards.articles.get;

export const test_get_article_when_board_is_public_and_request_is_unauthorized =
    async (connection: IConnection) => {
        const board_id = await Seed.getBoardId("board1");
        const article_id = await Seed.getArticleId(board_id);
        await APIValidator.assert(
            test(connection, board_id, article_id),
            HttpStatus.OK,
        )({
            success: true,
            assertBody: typia.createAssertEquals<IArticle>(),
        });
    };

export const test_get_article_when_board_is_private_and_request_is_unauthorized =
    async (connection: IConnection) => {
        const board_id = await Seed.getBoardId("board2");
        const article_id = await Seed.getArticleId(board_id);
        await APIValidator.assert(
            test(connection, board_id, article_id),
            HttpStatus.FORBIDDEN,
        )({
            success: false,
            assertBody:
                typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
        });
    };

export const test_get_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "user2");
    const board_id = await Seed.getBoardId("board3");
    const article_id = await Seed.getArticleId(board_id);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id, article_id),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};
export const test_get_article_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const board_id = await Seed.getBoardId("board3");
    const article_id = await Seed.getArticleId(board_id);
    await APIValidator.assert(
        test(
            Connection.authorize("invalid)adtoken")(connection),
            board_id,
            article_id,
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};
export const test_get_article_when_user_is_invalid = async (
    connection: IConnection,
) => {
    const username = "create_article_test";
    await Seed.createUser(username, null);
    const token = await get_token(connection, username);
    await Seed.deleteUser(username);
    const board_id = await Seed.getBoardId("board3");
    const article_id = await Seed.getArticleId(board_id);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id, article_id),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};
export const test_get_article_when_board_does_not_exist = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user1");
    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            Random.uuid(),
            Random.uuid(),
        ),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Board.NotFound>(),
    });
};
export const test_get_article_when_article_does_not_exist = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user2");
    const board_id = await Seed.getBoardId("board2");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id, Random.uuid()),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });
};
export const test_get_article_when_article_is_deleted = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user2");
    const board_id = await Seed.getBoardId("board2");
    const article_id = await Seed.getDeletedArticleId(board_id);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id, article_id),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });
};
export const test_get_article_when_membership_is_insufficient = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user1");
    const board_id = await Seed.getBoardId("board3");
    const article_id = await Seed.getArticleId(board_id);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id, article_id),
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });
};
