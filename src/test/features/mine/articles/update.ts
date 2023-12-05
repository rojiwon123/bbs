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
import { Regex } from "@APP/types/global";
import { Random } from "@APP/utils/random";

const test = api.functional.mine.articles.update;

const createBody = (
    attachment_ids: Regex.UUID[] = [],
): IArticle.IUpdateBody => ({
    ...typia.random<IArticle.IUpdateBody>(),
    attachment_ids,
});

export const test_update_mine_article_successfully = async (
    connection: IConnection,
) => {
    const username = "user1";
    const boardname = "board1";
    const token = await get_token(connection, username);
    const body = createBody();
    const article = await Seed.createArticle(
        { author: username, board: boardname, notice: false },
        {},
    );

    const before = await APIValidator.assert(
        api.functional.mine.articles.get(
            Connection.authorize(token)(connection),
            article.id,
        ),
        HttpStatus.OK,
    )({ success: true, assertBody: typia.createAssertEquals<IArticle>() });

    await APIValidator.assert(
        test(Connection.authorize(token)(connection), article.id, body),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.Identity>(),
    });

    const after = await APIValidator.assert(
        api.functional.mine.articles.get(
            Connection.authorize(token)(connection),
            article.id,
        ),
        HttpStatus.OK,
    )({ success: true, assertBody: typia.createAssertEquals<IArticle>() });

    assert.notDeepStrictEqual(
        before.title,
        body.title,
        "article already updated",
    );
    assert.deepStrictEqual(after.title, body.title, "article does not updated");

    await Seed.deleteArticle(article.id);
};

export const test_update_mine_article_when_token_is_missing = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(connection, Random.uuid(), createBody()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });
};

export const test_update_mine_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "user2");
    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            Random.uuid(),
            createBody(),
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const test_update_mine_article_when_token_is_invalid = async (
    connection: IConnection,
) => {
    await APIValidator.assert(
        test(
            Connection.authorize("invalid)adtoken")(connection),
            Random.uuid(),
            createBody(),
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_update_mine_article_when_user_is_invalid = async (
    connection: IConnection,
) => {
    const username = "update_mine_article_when_user_is_invalid";
    await Seed.createUser(username, null);
    const token = await get_token(connection, username);
    await Seed.deleteUser(username);
    await APIValidator.assert(
        test(
            Connection.authorize(token)(connection),
            Random.uuid(),
            createBody(),
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const test_update_mine_article_when_user_is_not_author = async (
    connection: IConnection,
) => {
    const username = "update_mine_article_when_user_is_not_author";
    await Seed.createUser(username, "골드");
    const token = await get_token(connection, username);
    const board_id = await Seed.getBoardId("board3");
    const article_id = await Seed.getArticleId(board_id);
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), article_id, createBody()),
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });

    await Seed.deleteUser(username);
};

export const test_update_mine_article_when_article_does_not_exist = async (
    connection: IConnection,
) => {
    const username = "user1";
    const token = await get_token(connection, username);
    const body = createBody();
    await APIValidator.assert(
        test(Connection.authorize(token)(connection), Random.uuid(), body),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });
};

export const test_update_mine_article_when_article_is_deleted = async (
    connection: IConnection,
) => {
    const username = "user1";
    const boardname = "board1";
    const token = await get_token(connection, username);
    const body = createBody();
    const article = await Seed.createArticle(
        {
            author: username,
            board: boardname,
            notice: false,
        },
        { is_deleted: true },
    );

    await APIValidator.assert(
        test(Connection.authorize(token)(connection), article.id, body),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });

    await Seed.deleteArticle(article.id);
};

export const test_seed_changed = Seed.check_size_changed;
