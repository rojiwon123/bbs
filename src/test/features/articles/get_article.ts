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

export const test_get_article_successfully = async (
    connection: IConnection,
) => {
    const article = await prisma.articles.findFirst({
        where: { deleted_at: null },
    });
    if (isNull(article)) throw Error("can't find any article");
    const response = await api.functional.articles.get(connection, article.id);
    Util.assertResposne({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IArticle>(),
    })(response);
};

export const test_get_article_but_article_is_deleted = async (
    connection: IConnection,
) => {
    const article = await prisma.articles.findFirst({
        where: { deleted_at: { not: null } },
    });
    if (isNull(article)) throw Error("can't find deleted article");
    const response = await api.functional.articles.get(connection, article.id);
    Util.assertResposne({
        status: HttpStatus.NOT_FOUND,
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    })(response);
};

export const test_get_article_but_not_exist = async (
    connection: IConnection,
) => {
    const response = await api.functional.articles.get(
        connection,
        Random.uuid(),
    );
    Util.assertResposne({
        status: HttpStatus.NOT_FOUND,
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    })(response);
};
