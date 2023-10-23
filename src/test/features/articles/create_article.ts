import { IConnection } from "@nestia/fetcher";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IArticle } from "@APP/types/IArticle";
import { Random } from "@APP/utils/random";

import {
    check_permission_expired,
    check_permission_invalid,
    check_permission_required,
    delete_user,
    get_expired_token,
    get_token,
    restore_delete_user,
} from "../auth/_fragment";
import {
    create_article,
    get_article,
    restore_create_article,
} from "./_fragment";

const test = (connection: IConnection) =>
    api.functional.articles.create(
        connection,
        typia.random<IArticle.ICreate>(),
    );

export const test_create_article_successfully = async (
    connection: IConnection,
) => {
    // sign-in
    const token = await get_token(connection, "testuser1");

    // create article
    const { article_id } = await create_article(
        Util.addToken(token)(connection),
    );

    // check really created
    await get_article(connection, article_id);

    // delete article
    await restore_create_article(article_id);
};

export const test_create_article_when_token_is_missing = (
    connection: IConnection,
) => check_permission_required(test(connection));

export const test_create_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "testuser1");
    await check_permission_expired(test(Util.addToken(token)(connection)));
};

export const test_create_article_when_token_is_invalid = (
    connection: IConnection,
) =>
    check_permission_invalid(
        test(Util.addToken(Random.string(20))(connection)),
    );

export const test_create_article_when_user_id_is_invalid = async (
    connection: IConnection,
) => {
    const username = "testuser1";
    const token = await get_token(connection, username);
    const { user_id } = await delete_user(username);

    await check_permission_invalid(test(Util.addToken(token)(connection)));

    await restore_delete_user(user_id);
};
