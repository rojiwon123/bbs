import core from "@nestia/core";
import * as nest from "@nestjs/common";

import { OauthUsecase } from "@APP/application/oauth.usecase";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

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
        const result = await OauthUsecase.getUrls();
        return Result.Ok.flatten(result);
    }

    /**
     * Oauth 인증을 통해 사용자 권한을 부여한 인증 토큰을 발급받습니다.
     *
     * 활성화된 인증 정보에 활성화된 사용자 정보가 연동되어 있어야 합니다.
     *
     * @summary 소셜 로그인 API
     * @tag auth
     * @param body oauth 유형과 code 정보를 전달
     * @return 권한 토큰
     */
    @core.TypedException<ErrorCode.User.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedException<ErrorCode.Authentication>(
        nest.HttpStatus.UNAUTHORIZED,
        "Oauth 인증 실패",
    )
    @nest.HttpCode(nest.HttpStatus.OK)
    @core.TypedRoute.Post("sign-in")
    async signInByOauth(
        @core.TypedBody() body: IAuthentication.IOauthInput,
    ): Promise<IAuthentication> {
        const result = await OauthUsecase.signInByOauth(body);
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        if (error instanceof Failure.Internal)
            switch (error.message) {
                case "AUTHENTICATION_FAIL":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.UNAUTHORIZED,
                    );
                case "NOT_FOUND_USER":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }

    /**
     * Oauth 인증을 통해 사용자 정보를 생성하고 인증 토큰을 발급합니다.
     *
     * 활성화된 인증정보가 존재하고
     *
     * @summary 소셜 간편가입 API
     * @tag auth
     * @param body oauth 유형과 code 정보를 전달
     * @return 권한 토큰
     */
    @core.TypedException<ErrorCode.Authentication>(
        nest.HttpStatus.UNAUTHORIZED,
        "Oauth 인증 실패",
    )
    @core.TypedRoute.Post("sign-up")
    async signUpByOauth(
        @core.TypedBody() body: IAuthentication.IOauthInput,
    ): Promise<IAuthentication> {
        const result = await OauthUsecase.signUpByOauth(body);
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        if (error instanceof Failure.Internal)
            switch (error.message) {
                case "AUTHENTICATION_FAIL":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.UNAUTHORIZED,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }
}
