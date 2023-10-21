import { RandomGenerator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Seed } from "@APP/test/internal/seed";
import { Util } from "@APP/test/internal/utils";
import { IArticle } from "@APP/types/IArticle";
import { IAuthentication } from "@APP/types/IAuthentication";
import { IComment } from "@APP/types/IComment";

const test = (
    connection: IConnection,
    article_id: string & typia.tags.Format<"uuid">,
) =>
    api.functional.articles.comments.create(
        connection,
        article_id,
        typia.random<IComment.ICreate>(),
    );

export const create_comment_successfully = async (connection: IConnection) => {
    // sign-in
    const {
        access_token: { token },
    } = await Util.assertResponse(
        api.functional.auth.oauth.authorize(connection, {
            oauth_type: "github",
            code: "testuser1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    const permission = Util.addToken(token)(connection);

    // find article
    const { data } = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });
    const article = RandomGenerator.pick(data);

    // create comment
    const { comment_id } = await Util.assertResponse(
        test(permission, article.id),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    // check really created
    const check = await prisma.comments.count({
        where: { id: comment_id, deleted_at: null },
    });
    if (check !== 1) throw Error("comment does not created");
    // delete comment
    await Seed.deletedComment(comment_id);
};
