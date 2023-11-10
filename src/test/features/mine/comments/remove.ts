import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Connection } from "@APP/test/internal/connection";
import { get_expired_token, get_token } from "@APP/test/internal/fragment";
import { Seed } from "@APP/test/internal/seed";
import { APIValidator } from "@APP/test/internal/validator";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";
import { Random } from "@APP/utils/random";

const test = api.functional.mine.comments.remove;

export const test_remove_mine_comment_successfully = async (
    _connection: IConnection,
) => {
    const username = "user1";
    const boardname = "board1";
    const connection = Connection.authorize(
        await get_token(_connection, username),
    )(_connection);
    const board_id = await Seed.getBoardId(boardname);
    const article_id = await Seed.getArticleId(board_id);
    const comment = await Seed.createComment(
        {
            article_id,
            author: username,
            parent_id: null,
        },
        {},
    );
    await APIValidator.assert(
        api.functional.mine.comments.get(connection, comment.id),
        HttpStatus.OK,
    )({ success: true, assertBody: typia.createAssertEquals<IComment>() });

    await APIValidator.assert(
        test(connection, comment.id),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    await APIValidator.assert(
        api.functional.mine.comments.get(connection, comment.id),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Comment.NotFound>(),
    });

    await Seed.deleteComment(comment.id);
};

export const test_remove_mine_comment_when_token_is_missing = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(connection, Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });
};

export const test_remove_mine_comment_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "user2");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const test_remove_mine_comment_when_token_is_invalid = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(
            Connection.authorize("invalid)adtoken")(connection),
            Random.uuid(),
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_remove_mine_comment_when_user_is_invalid = async (
    connection: IConnection,
) => {
    const username = "remove_mine_comment_when_user_is_invalid";
    await Seed.createUser(username, null);
    const token = await get_token(connection, username);
    await Seed.deleteUser(username);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_remove_mine_comment_when_user_is_not_author = async (
    connection: IConnection,
) => {
    const username = "remove_mine_comment_when_user_is_not_author";
    await Seed.createUser(username, "골드");
    const token = await get_token(connection, username);
    const board_id = await Seed.getBoardId("board3");
    const article_id = await Seed.getArticleId(board_id);
    const comment_id = await Seed.getCommentId(article_id);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), comment_id),
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });

    await Seed.deleteUser(username);
};

export const test_remove_mine_comment_when_comment_does_not_exist = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user2");
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), Random.uuid()),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Comment.NotFound>(),
    });
};

export const test_remove_mine_comment_when_comment_is_deleted = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "user2");
    const board_id = await Seed.getBoardId("board2");
    const article_id = await Seed.getArticleId(board_id);
    const comment_id = await Seed.getDeletedCommentId(article_id);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), comment_id),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Comment.NotFound>(),
    });
};

export const test_seed_changed = Seed.check_size_changed;
