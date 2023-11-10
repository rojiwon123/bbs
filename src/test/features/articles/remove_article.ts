import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IArticle } from "@APP/types/IArticle";

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
    check_article_not_found,
    create_article,
    get_article_id_random,
    restore_create_article,
} from "./_fragment";

const test = api.functional.articles.remove;

export const test_remove_article_successfully = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);
    const { article_id } = await create_article(permission);

    await Util.assertResponse(
        test(permission, article_id),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.Identity>(),
    });

    await check_article_not_found(test(permission, article_id));
    await restore_create_article(article_id);
};

export const test_remove_article_when_user_is_not_author = async (
    connection: IConnection,
) => {
    // sign-in
    const token = await get_token(connection, "testuser1");

    const permission = Util.addToken(token)(connection);

    const article_id = await get_article_id_random(connection);

    await check_permission_insufficient(test(permission, article_id));
};

export const test_remove_article_when_token_is_missing = async (
    connection: IConnection,
) => {
    const article_id = await get_article_id_random(connection);

    await check_permission_required(test(connection, article_id));
};

export const test_remove_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "testuser1");

    const permission = Util.addToken(token)(connection);

    const article_id = await get_article_id_random(connection);

    await check_permission_expired(test(permission, article_id));
};

export const test_remove_article_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const permission = Util.addToken("gmdfkgmdpk")(connection);

    const article_id = await get_article_id_random(connection);

    await check_permission_invalid(test(permission, article_id));
};

export const test_remove_article_when_user_id_is_invalid = async (
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
