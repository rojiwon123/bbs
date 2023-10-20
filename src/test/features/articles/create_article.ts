import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IArticle } from "@APP/types/IArticle";
import { IAuthentication } from "@APP/types/IAuthentication";

const test = (connection: IConnection) =>
    Util.assertResposne(api.functional.articles.create)(
        connection,
        typia.random<IArticle.ICreate>(),
    );

export const test_create_article_successfully = async (
    connection: IConnection,
) => {
    // sign-in
    const auth = await Util.assertResposne(api.functional.auth.oauth.authorize)(
        connection,
        {
            oauth_type: "github",
            code: "testuser1",
        },
    )({
        status: HttpStatus.OK,
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication>(),
    });

    // create article
    return test(Util.addToken(auth.access_token.token)(connection))({
        status: HttpStatus.CREATED,
        success: true,
        assertBody: typia.createAssertEquals<IArticle>(),
    });
};
