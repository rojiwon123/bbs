import { IConnection } from "@nestia/fetcher";
import { HttpStatus } from "@nestjs/common";
import api from "@project/api";
import typia from "typia";

import { APIValidator } from "@APP/test/internal/validator";
import { IAuthentication } from "@APP/types/IAuthentication";

export const test_get_oauth_login_urls = async (connection: IConnection) =>
    APIValidator.assert(
        api.functional.auth.oauth.urls.getUrls(connection),
        HttpStatus.OK,
    )({
        success: true,
        assertBody: typia.createAssertEquals<IAuthentication.IOauthUrls>(),
    });
