import { IConnection } from "@nestia/fetcher";
import api from "@project/api";

import { prisma } from "@APP/infrastructure/DB";
import { DateMapper } from "@APP/utils/date";
import { Random } from "@APP/utils/random";

import {
    check_article_not_found,
    get_article,
    get_article_id_random,
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
    await prisma.articles.updateMany({
        where: { id: article_id },
        data: { deleted_at: DateMapper.toISO() },
    });

    await check_article_not_found(test(connection, article_id));

    await prisma.articles.updateMany({
        where: { id: article_id },
        data: { deleted_at: null },
    });
};

export const test_get_article_when_article_does_not_exist = (
    connection: IConnection,
) => check_article_not_found(test(connection, Random.uuid()));
