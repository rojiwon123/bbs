import { RandomGenerator } from "@nestia/e2e";
import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Mock } from "@APP/test/internal/mock";
import { Seed } from "@APP/test/internal/seed";
import { Util } from "@APP/test/internal/utils";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { IAuthentication } from "@APP/types/IAuthentication";
import { IComment } from "@APP/types/IComment";
import { DateMapper } from "@APP/utils/date";
import { Random } from "@APP/utils/random";

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
    await Seed.deleteComment(comment_id);
};

export const create_comment_when_article_does_not_exist = async (
    connection: IConnection,
) => {
    // before
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

    await Util.assertResponse(
        test(permission, Random.uuid()),
        HttpStatus.NOT_FOUND,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Article.NotFound>(),
    });
};

export const create_comment_when_token_is_missing = (connection: IConnection) =>
    Util.assertResponse(
        test(connection, Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });

export const create_comment_when_token_is_expired = async (
    connection: IConnection,
) => {
    Mock.implement(DateMapper, "toISO", () => {
        const now = new Date();
        now.setFullYear(now.getFullYear() - 1);
        return now.toISOString();
    });

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
    Mock.restore(DateMapper, "toISO");

    await Util.assertResponse(
        test(permission, Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const create_comment_when_token_is_invalid = (connection: IConnection) =>
    Util.assertResponse(
        test(Util.addToken("invalid1teosdfsdwn")(connection), Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });

export const create_comment_when_user_is_invalid = async (
    connection: IConnection,
) => {
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

    await prisma.users.updateMany({
        where: { name: "testuser1" },
        data: { deleted_at: DateMapper.toISO() },
    });

    await Util.assertResponse(
        test(Util.addToken(token)(connection), Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });

    await prisma.users.updateMany({
        where: { name: "testuser1" },
        data: { deleted_at: null },
    });
};
