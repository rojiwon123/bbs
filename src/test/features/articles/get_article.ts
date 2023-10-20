import { isNull } from "@fxts/core";
import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Util } from "@APP/test/internal/utils";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { Random } from "@APP/utils/random";

const test = api.functional.articles.get;

export const test_get_article_successfully = async (
    connection: IConnection,
) => {
    const article = await prisma.articles.findFirst({
        where: { deleted_at: null },
    });
    if (isNull(article)) throw Error("can't find any article");
    return Util.assertResponse(
        test(connection, article.id),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle>(),
    });
};

export const test_get_article_when_article_is_deleted = async (
    connection: IConnection,
) => {
    const article = await prisma.articles.findFirst({
        where: { deleted_at: { not: null } },
    });
    if (isNull(article)) throw Error("can't find deleted article");
    return Util.assertResponse(
        test(connection, article.id),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });
};

export const test_get_article_when_article_does_not_exist = (
    connection: IConnection,
) =>
    Util.assertResponse(
        test(connection, Random.uuid()),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });
