import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { Util } from "@APP/test/internal/utils";
import { IAuthentication } from "@APP/types/IAuthentication";

export const get_oauth_login_urls = async (connection: IConnection) =>
    Util.assertResponse(
        api.functional.auth.oauth.urls.getUrls(connection),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication.IOauthUrls>(),
    });
