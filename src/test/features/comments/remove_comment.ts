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

const test = api.functional.articles.comments.remove;

export const remove_comment_successfully = async (connection: IConnection) => {
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
    const article_list = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article_id = RandomGenerator.pick(article_list.data).id;

    // create comment
    const { comment_id } = await Util.assertResponse(
        api.functional.articles.comments.create(
            permission,
            article_id,
            typia.random<IComment.ICreate>(),
        ),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    // remove comment
    await Util.assertResponse(
        test(permission, article_id, comment_id),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    // then
    const count = await prisma.comments.count({
        where: { id: comment_id, deleted_at: null },
    });

    if (count > 0) throw Error("comment does not removed");

    await Seed.deleteComment(comment_id);
};

export const remove_comment_when_user_is_not_author = async (
    connection: IConnection,
) => {
    // sign-in
    const {
        access_token: { token },
    } = await Util.assertResponse(
        api.functional.auth.oauth.authorize(connection, {
            oauth_type: "github",
            code: "author1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    // find article
    const article_list = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article_id = RandomGenerator.pick(article_list.data).id;

    // create comment
    const { comment_id } = await Util.assertResponse(
        api.functional.articles.comments.create(
            Util.addToken(token)(connection),
            article_id,
            typia.random<IComment.ICreate>(),
        ),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    const { access_token } = await Util.assertResponse(
        api.functional.auth.oauth.authorize(connection, {
            oauth_type: "kakao",
            code: "testuser1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    // remove comment
    await Util.assertResponse(
        test(
            Util.addToken(access_token.token)(connection),
            article_id,
            comment_id,
        ),
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });

    await Seed.deleteComment(comment_id);
};

export const remove_comment_when_token_is_missing = async (
    connection: IConnection,
) => {
    const { data } = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article_id = RandomGenerator.pick(data).id;

    // remove article
    await Util.assertResponse(
        test(connection, article_id, Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });
};

export const remove_comment_when_token_is_expired = async (
    connection: IConnection,
) => {
    Mock.implement(DateMapper, "toISO", () => {
        const now = new Date();
        now.setFullYear(now.getFullYear() - 1);
        return now.toISOString();
    });

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

    Mock.restore(DateMapper, "toISO");

    const permission = Util.addToken(token)(connection);

    const { data } = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article_id = RandomGenerator.pick(data).id;

    // remove comment
    await Util.assertResponse(
        test(permission, article_id, Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const remove_comment_when_token_is_invalid = async (
    connection: IConnection,
) => {
    const permission = Util.addToken("gmdfkgmdpk")(connection);

    const { data } = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article_id = RandomGenerator.pick(data).id;

    // remove comment
    await Util.assertResponse(
        test(permission, article_id, Random.uuid()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const remove_comment_when_user_id_is_invalid = async (
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

    const permission = Util.addToken(token)(connection);

    const { data } = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article_id = RandomGenerator.pick(data).id;

    await prisma.users.updateMany({
        where: { name: "testuser1" },
        data: { deleted_at: DateMapper.toISO() },
    });

    // remove comment
    await Util.assertResponse(
        test(permission, article_id, Random.uuid()),
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
