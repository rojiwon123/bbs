import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IComment } from "@APP/types/IComment";
import { Random } from "@APP/utils/random";

import {
    check_article_not_found,
    get_article_id_random,
} from "../articles/_fragment";
import { get_token } from "../auth/_fragment";
import { create_comment, restore_create_comment } from "./_fragment";

const test = api.functional.articles.comments.getList;

export const test_get_comment_list_successfully = async (
    connection: IConnection,
) => {
    const token = await get_token(connection, "testuser1");
    const permission = Util.addToken(token)(connection);
    const article_id = await get_article_id_random(connection);
    const { comment_id } = await create_comment(permission, article_id);

    await Util.assertResponse(
        test(connection, article_id, {}),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: Util.assertNotEmptyPaginatedResponse(
            typia.createAssertEquals<IComment.IPaginatedResponse>(),
        ),
    });

    await restore_create_comment(comment_id);
};

export const test_get_comment_list_when_article_does_not_exist = (
    connection: IConnection,
) => check_article_not_found(test(connection, Random.uuid(), {}));
