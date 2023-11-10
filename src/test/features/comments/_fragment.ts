import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Util } from "@APP/test/internal/utils";
import { IComment } from "@APP/types/IComment";

export const create_comment = (
    connection: IConnection,
    article_id: string & typia.tags.Format<"uuid">,
) =>
    Util.assertResponse(
        api.functional.comments.create(connection, {
            ...typia.random<IComment.ICreate>(),
            article_id,
        }),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

export const restore_create_comment = async (comment_id: string) => {
    await prisma.comment_snapshots.deleteMany({
        where: { comment_id },
    });
    await prisma.comments.delete({ where: { id: comment_id } });
};

export const get_comment_list = (
    connection: IConnection,
    article_id: string & typia.tags.Format<"uuid">,
) =>
    Util.assertResponse(
        api.functional.comments.getList(connection, { article_id }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.IPaginatedResponse>(),
    });
