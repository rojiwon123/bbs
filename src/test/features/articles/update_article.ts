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
    create_article,
    get_article,
    get_article_id_random,
    restore_create_article,
} from "./_fragment";

const test = (
    connection: IConnection,
    article_id: string & typia.tags.Format<"uuid">,
) =>
    api.functional.articles.update(
        connection,
        article_id,
        typia.random<IArticle.ICreate>(),
    );

export const test_update_article_successfully = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);
    const { article_id } = await create_article(permission);
    const now = new Date();

    // update article
    await Util.assertResponse(
        test(permission, article_id),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.Identity>(),
    });

    const article = await get_article(connection, article_id);
    const last_snapshot = article.snapshots.at(0)!;
    if (now >= new Date(last_snapshot.created_at))
        throw Error("article snapshot does not created");
    await restore_create_article(article_id);
};

export const test_update_article_when_user_is_not_author = async (
    connection: IConnection,
) => {
    // sign-in
    const token = await get_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);

    const article_id = await get_article_id_random(connection);

    await check_permission_insufficient(test(permission, article_id));
};

export const test_update_article_when_token_is_missing = async (
    connection: IConnection,
) => {
    const article_id = await get_article_id_random(connection);

    await check_permission_required(test(connection, article_id));
};

export const test_update_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    const token = await get_expired_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);

    const article_id = await get_article_id_random(connection);

    await check_permission_expired(test(permission, article_id));
};

export const test_update_article_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const article_id = await get_article_id_random(connection);

    await check_permission_invalid(
        test(Util.addToken("fsoefn")(connection), article_id),
    );
};

export const test_update_article_when_user_id_is_invalid = async (
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
