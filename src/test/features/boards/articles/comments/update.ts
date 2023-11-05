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
import { IComment } from "@APP/types/IComment";
import { Random } from "@APP/utils/random";

const test = api.functional.boards.articles.comments.update;

const createBody = typia.createRandom<IComment.IUpdateBody>();

export const test_update_comment_successfully = async (
    connection: IConnection,
) => {
    const username = "user1";
    const boardname = "board1";
    const token = await get_token(connection, username);
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
    const body = createBody();

    const before = await APIValidator.assert(
        api.functional.boards.articles.comments.get(
            connection,
            board_id,
            article_id,
            comment.id,
        ),
        HttpStatus.OK,
    )({ success: true, assertBody: typia.createAssertEquals<IComment>() });

    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            board_id,
            article_id,
            comment.id,
            body,
        ),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    const after = await APIValidator.assert(
        api.functional.boards.articles.comments.get(
            connection,
            board_id,
            article_id,
            comment.id,
        ),
        HttpStatus.OK,
    )({ success: true, assertBody: typia.createAssertEquals<IComment>() });

    assert.notDeepStrictEqual(
        before.body,
        body.body,
        "article already updated",
    );
    assert.deepStrictEqual(after.body, body.body, "article does not updated");

    await Seed.deleteComment(comment.id);
};

export const test_update_comment_when_token_is_missing = async (
    connection: IConnection,
) => {
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(connection, board_id, Random.uuid(), Random.uuid(), createBody()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });
};

export const test_update_comment_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "user2");
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            board_id,
            Random.uuid(),
            Random.uuid(),
            createBody(),
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const test_update_comment_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const board_id = await Seed.getBoardId("board3");
    await APIValidator.assert(
        test(
            Connection.authorize("invalid)adtoken")(connection),
            board_id,
            Random.uuid(),
            Random.uuid(),
            createBody(),
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_update_comment_when_user_is_invalid = async (
    connection: IConnection,
) => {
    const username = "update_comment_when_user_is_invalid";
    await Seed.createUser(username, null);
    const token = await get_token(connection, username);
    await Seed.deleteUser(username);
    const board_id = await Seed.getBoardId("board3");

    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            board_id,
            Random.uuid(),
            Random.uuid(),
            createBody(),
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_update_comment_when_user_is_not_author = async (
    connection: IConnection,
) => {
    const username = "update_comment_when_user_is_not_author";
    await Seed.createUser(username, "골드");
    const token = await get_token(connection, username);
    const board_id = await Seed.getBoardId("board3");
    const article_id = await Seed.getArticleId(board_id);
    const comment_id = await Seed.getCommentId(article_id);
    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            board_id,
            article_id,
            comment_id,
            createBody(),
        ),
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });

    await Seed.deleteUser(username);
};

export const test_update_comment_when_comment_does_not_exist = async (
    connection: IConnection,
) => {
    const username = "user1";
    const boardname = "board1";
    const token = await get_token(connection, username);
    const board_id = await Seed.getBoardId(boardname);
    const article_id = await Seed.getArticleId(board_id);
    const body = createBody();
    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            board_id,
            article_id,
            Random.uuid(),
            body,
        ),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Comment.NotFound>(),
    });
};

export const test_update_comment_when_comment_is_deleted = async (
    connection: IConnection,
) => {
    const username = "user1";
    const boardname = "board1";
    const token = await get_token(connection, username);
    const board_id = await Seed.getBoardId(boardname);
    const article_id = await Seed.getArticleId(board_id);
    const comment_id = await Seed.getDeletedCommentId(article_id);
    const body = createBody();
    const article = await Seed.createArticle(
        {
            author: username,
            board: boardname,
            is_notice: false,
        },
        { is_deleted: true },
    );

    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            board_id,
            article_id,
            comment_id,
            body,
        ),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Comment.NotFound>(),
    });

    await Seed.deleteArticle(article.id);
};

export const test_seed_changed = Seed.check_size_changed;
