import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IComment } from "@APP/types/IComment";
import { Random } from "@APP/utils/random";

import {
    create_article,
    get_article_id_random,
    restore_create_article,
} from "../articles/_fragment";
import {
    check_permission_expired,
    check_permission_insufficient,
    check_permission_invalid,
    check_permission_required,
    get_expired_token,
    get_token,
    remove_user,
    restore_remove_user,
} from "../auth/_fragment";
import {
    create_comment,
    get_comment_list,
    restore_create_comment,
} from "./_fragment";

const test = api.functional.comments.remove;

export const test_remove_comment_successfully = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);
    const { article_id } = await create_article(permission);
    const { comment_id } = await create_comment(permission, article_id);

    await Util.assertResponse(
        test(permission, comment_id),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    const comments = await get_comment_list(connection, article_id);

    if (comments.data.length !== 0) throw Error("comment does not removed");

    await restore_create_comment(comment_id);
    await restore_create_article(article_id);
};

export const test_remove_comment_when_user_is_not_author = async (
    connection: IConnection,
) => {
    const permission = Util.addToken(await get_token(connection, "testuser1"))(
        connection,
    );
    const article_id = await get_article_id_random(connection);
    const { comment_id } = await create_comment(permission, article_id);
    const token = await get_token(connection, "testuser2");

    await check_permission_insufficient(
        test(Util.addToken(token)(connection), comment_id),
    );

    await restore_create_comment(comment_id);
};

export const test_remove_comment_when_token_is_missing = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);
    const article_id = await get_article_id_random(connection);
    const { comment_id } = await create_comment(permission, article_id);

    await check_permission_required(test(connection, comment_id));

    await restore_create_comment(comment_id);
};

export const test_remove_comment_when_token_is_expired = async (
    connection: IConnection,
) => {
    const article_id = await get_article_id_random(connection);
    const { comment_id } = await create_comment(
        Util.addToken(await get_token(connection, "testuser1"))(connection),
        article_id,
    );
    const expired_token = await get_expired_token(connection, "testuser1");

    await check_permission_expired(
        test(Util.addToken(expired_token)(connection), comment_id),
    );

    await restore_create_comment(comment_id);
};

export const test_remove_comment_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const article_id = await get_article_id_random(connection);
    const { comment_id } = await create_comment(
        Util.addToken(await get_token(connection, "testuser1"))(connection),
        article_id,
    );

    await check_permission_invalid(
        test(Util.addToken(Random.string(20))(connection), comment_id),
    );

    await restore_create_comment(comment_id);
};

export const test_remove_comment_when_user_id_is_invalid = async (
    connection: IConnection,
) => {
    const username = "testuser1";
    const token = await get_token(connection, username);
    const permission = Util.addToken(token)(connection);
    const article_id = await get_article_id_random(connection);
    const { comment_id } = await create_comment(permission, article_id);
    const { user_id } = await remove_user(username);

    await check_permission_invalid(test(permission, comment_id));

    await restore_remove_user(user_id);
    await restore_create_comment(comment_id);
};
