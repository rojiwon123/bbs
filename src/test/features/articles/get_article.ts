import { IConnection } from "@nestia/fetcher";
import api from "@project/api";

import { Random } from "@APP/utils/random";

import {
    check_article_not_found,
    get_article,
    get_article_id_random,
    remove_article,
    restore_remove_article,
} from "./_fragment";

const test = api.functional.articles.get;

export const test_get_article_successfully = async (
    connection: IConnection,
) => {
    const article_id = await get_article_id_random(connection);
    await get_article(connection, article_id);
};

export const test_get_article_when_article_is_deleted = async (
    connection: IConnection,
) => {
    const article_id = await get_article_id_random(connection);
    await remove_article(article_id);

    await check_article_not_found(test(connection, article_id));

    await restore_remove_article(article_id);
};

export const test_get_article_when_article_does_not_exist = (
    connection: IConnection,
) => check_article_not_found(test(connection, Random.uuid()));
