import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Util } from "@APP/test/internal/utils";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";
import { Random } from "@APP/utils/random";

const test = api.functional.articles.comments.getList;

export const test_get_comment_list_successfully = async (
    connection: IConnection,
) => {
    const comment = (await prisma.comments.findFirst({
        where: { deleted_at: null },
        select: { article_id: true },
    }))!;
    await Util.assertResponse(
        test(connection, comment.article_id, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: (input) => {
            const body = typia.assertEquals<IComment.IPaginatedResponse>(input);
            if (body.data.length === 0) throw Error("comment list is empty!");
            return body;
        },
    });
};

export const test_get_comment_list_when_article_does_not_exist = (
    connection: IConnection,
) =>
    Util.assertResponse(
        test(connection, Random.uuid(), {}),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });
