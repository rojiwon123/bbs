import { IConnection } from "@nestia/fetcher";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IComment } from "@APP/types/IComment";
import { Random } from "@APP/utils/random";

import {
    check_article_not_found,
    create_article,
    get_article_id_random,
    restore_create_article,
} from "../articles/_fragment";
import {
    check_permission_expired,
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

const test = (
    connection: IConnection,
    article_id: string & typia.tags.Format<"uuid">,
) =>
    api.functional.articles.comments.create(
        connection,
        article_id,
        typia.random<IComment.ICreate>(),
    );

export const test_create_comment_successfully = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);
    const { article_id } = await create_article(permission);

    const { comment_id } = await create_comment(permission, article_id);

    const comments = await get_comment_list(connection, article_id);
    if (comments.data.length === 0) throw Error("comment does not created");

    await restore_create_comment(comment_id);
    await restore_create_article(article_id);
};

export const test_create_comment_when_article_does_not_exist = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);

    await check_article_not_found(test(permission, Random.uuid()));
};

export const test_create_comment_when_token_is_missing = async (
    connection: IConnection,
) => {
    const article_id = await get_article_id_random(connection);

    await check_permission_required(test(connection, article_id));
};

export const test_create_comment_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);

    const article_id = await get_article_id_random(connection);

    await check_permission_expired(test(permission, article_id));
};

export const test_create_comment_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const permission = Util.addToken(Random.string(20))(connection);

    const article_id = await get_article_id_random(connection);

    await check_permission_invalid(test(permission, article_id));
};

export const test_create_comment_when_user_is_invalid = async (
    connection: IConnection,
) => {
    const username = "testuser1";
    const token = await get_token(connection, username);
    const permission = Util.addToken(token)(connection);
    const article_id = await get_article_id_random(connection);
    const { user_id } = await remove_user(username);

    await check_permission_invalid(test(permission, article_id));

    await restore_remove_user(user_id);
};
