import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IArticle } from "@APP/types/IArticle";

const fetch = api.functional.articles.getList;

export const test_get_article_list_successfully = async (
    connection: IConnection,
) => {
    const response = await fetch(connection, {
        skip: 0,
        limit: 10,
    });
    Util.assertResposne({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IArticle.IPaginatedResponse>(),
    })(response);
};
