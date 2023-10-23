import { RandomGenerator } from "@nestia/e2e";
import { IConnection, IPropagation } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Util } from "@APP/test/internal/utils";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { DateMapper } from "@APP/utils/date";

export const create_article = (connection: IConnection) =>
    Util.assertResponse(
        api.functional.articles.create(
            connection,
            typia.random<IArticle.ICreate>(),
        ),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.Identity>(),
    });

export const restore_create_article = async (
    article_id: string & typia.tags.Format<"uuid">,
) => {
    await prisma.article_snapshot_attachments.deleteMany({
        where: { snapshot: { article_id } },
    });
    await prisma.article_snapshots.deleteMany({ where: { article_id } });
    await prisma.articles.delete({ where: { id: article_id } });
};

export const get_article = (
    connection: IConnection,
    article_id: string & typia.tags.Format<"uuid">,
) =>
    Util.assertResponse(
        api.functional.articles.get(connection, article_id),
        HttpStatus.OK,
    )({ success: true, assertBody: typia.createAssertEquals<IArticle>() });

export const get_article_id_random = async (connection: IConnection) => {
    const { data } = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: Util.assertNotEmptyPaginatedResponse(
            typia.createAssertEquals<IArticle.IPaginatedResponse>(),
        ),
    });
    return RandomGenerator.pick(data).id;
};

export const check_article_not_found = (
    response: Promise<
        | IPropagation.IBranch<boolean, unknown, any>
        | IPropagation.IBranch<false, HttpStatus.NOT_FOUND, unknown>
    >,
) =>
    Util.assertResponse(
        response,
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });

export const remove_article = async (
    article_id: string & typia.tags.Format<"uuid">,
) => {
    await prisma.articles.update({
        where: { id: article_id, deleted_at: null },
        data: { deleted_at: DateMapper.toISO() },
    });
    return { article_id };
};

export const restore_remove_article = async (
    article_id: string & typia.tags.Format<"uuid">,
) => {
    await prisma.articles.update({
        where: { id: article_id, deleted_at: { not: null } },
        data: { deleted_at: null },
    });
};
