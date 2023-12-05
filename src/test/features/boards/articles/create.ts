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
import { Regex } from "@APP/types/global";
import { Random } from "@APP/utils/random";

const test = (
    connection: IConnection,
    board_id: string & typia.tags.Format<"uuid">,
    attachment_ids: Regex.UUID[] = [],
) =>
    api.functional.boards.articles.create(connection, board_id, {
        ...typia.random<IArticle.ICreateBody>(),
        attachment_ids,
    });

export const test_create_article_successfully = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user3");
    const board_id = await Seed.getBoardId("board1");
    const { article_id } = await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.Identity>(),
    });

    await Seed.deleteArticle(article_id);
};

export const test_create_article_when_token_is_missing = async (
    connection: IConnection,
) => {
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(connection, board_id),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });
};

export const test_create_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "user2");
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const test_create_article_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(Connection.authorize("invalid)adtoken")(connection), board_id),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_create_article_when_user_is_invalid = async (
    connection: IConnection,
) => {
    const username = "create_article_when_user_is_invalid";
    await Seed.createUser(username, null);
    const token = await get_token(connection, username);
    await Seed.deleteUser(username);
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_create_article_when_board_does_not_exist = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user1");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), Random.uuid()),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Board.NotFound>(),
    });
};

export const test_create_article_when_membership_is_insufficient = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user1");
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), board_id),
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });
};

export const test_seed_changed = Seed.check_size_changed;
