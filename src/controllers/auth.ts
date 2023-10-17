import core from "@nestia/core";
import * as nest from "@nestjs/common";

import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";

@nest.Controller("auth/oauth")
export class OAuthController {
    /**
     * oauth 로그인 페이지 주소를 key:value 형식으로 응답
     *
     * @summary oauth 로그인 페이지 주소 목록
     * @tag auth
     * @return oauth 로그인 페이지 주소 객체
     */
    @core.TypedRoute.Get("urls")
    async getUrls(): Promise<IAuthentication.IOauthUrls> {
        return {
            kakao: "",
            github: "",
        };
    }

    /**
     * oauth 인증을 통해 사용자 권한이 인가된 토큰을 응답
     *
     * @summary oauth 인증
     * @tag auth
     * @param body oauth 유형과 code 정보를 전달
     * @return 권한 토큰
     */
    @core.TypedException<ErrorCode.Authentication>(
        nest.HttpStatus.UNAUTHORIZED,
        "인증 실패",
    )
    @nest.HttpCode(nest.HttpStatus.OK)
    @core.TypedRoute.Post("authorize")
    async authorize(
        @core.TypedBody() body: IAuthentication.IOauthInput,
    ): Promise<IAuthentication> {
        body;
        throw Error("");
    }
}
