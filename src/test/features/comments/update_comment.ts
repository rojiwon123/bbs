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

const test = api.functional.articles.comments.update;

const createBody = typia.createRandom<IComment.ICreate>();

export const update_comment_successfully = async (connection: IConnection) => {
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

    // create comment
    const { comment_id } = await Util.assertResponse(
        api.functional.articles.comments.create(
            permission,
            article_id,
            createBody(),
        ),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    // update article
    await Util.assertResponse(
        test(permission, article_id, comment_id, createBody()),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    // then

    const count = await prisma.comment_snapshots.count({
        where: { comment_id },
    });
    if (count !== 2) throw Error("snapshot does now created");

    await Seed.deletedComment(comment_id);
};

export const update_article_when_user_is_not_author = async (
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

    const { data } = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article_id = RandomGenerator.pick(data).id;

    // create comment
    const { comment_id } = await Util.assertResponse(
        api.functional.articles.comments.create(
            Util.addToken(token)(connection),
            article_id,
            createBody(),
        ),
        HttpStatus.CREATED,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IComment.Identity>(),
    });

    const { access_token } = await Util.assertResponse(
        api.functional.auth.oauth.authorize(connection, {
            oauth_type: "github",
            code: "testuser1",
        }),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    // update article
    await Util.assertResponse(
        test(
            Util.addToken(access_token.token)(connection),
            article_id,
            comment_id,
            createBody(),
        ),
        HttpStatus.FORBIDDEN,
    )({
        success: false,
        assertBody:
            typia.createAssertEquals<ErrorCode.Permission.Insufficient>(),
    });

    await Seed.deletedComment(comment_id);
};

export const update_article_when_token_is_missing = async (
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

    // update article
    await Util.assertResponse(
        test(connection, article_id, Random.uuid(), createBody()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Required>(),
    });
};

export const update_article_when_token_is_expired = async (
    connection: IConnection,
) => {
    // mocking for generating expired token
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

    const permission = Util.addToken(token)(connection);

    Mock.restore(DateMapper, "toISO");

    const { data } = await Util.assertResponse(
        api.functional.articles.getList(connection, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    });

    const article_id = RandomGenerator.pick(data).id;

    // update article
    await Util.assertResponse(
        test(permission, article_id, Random.uuid(), createBody()),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Expired>(),
    });
};

export const update_article_when_token_is_invalid = async (
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

    // update article
    await Util.assertResponse(
        test(
            Util.addToken("fsoefn")(connection),
            article_id,
            Random.uuid(),
            createBody(),
        ),
        HttpStatus.UNAUTHORIZED,
    )({
        success: false,
        assertBody: typia.createAssertEquals<ErrorCode.Permission.Invalid>(),
    });
};

export const update_article_when_user_id_is_invalid = async (
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

    // update article
    await Util.assertResponse(
        test(permission, article_id, Random.uuid(), createBody()),
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
