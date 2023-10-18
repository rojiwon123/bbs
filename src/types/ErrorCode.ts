export namespace ErrorCode {
    /**
     * body, query, param 등 사용자로부터 얻은 데이터의 형식이 올바르지 않은 경우
     */
    export type InvalidInput = "INVALID_INPUT";
    /**
     * 인증 헤더가 누락되거나 올바르지 않은 경우
     */
    export type Authorization = "UNAUTHORIZED_REQUEST";
    /** oauth 인증이 실패하는 경우 */
    export type Authentication = "AUTHENTICATION_FAIL";

    /** 요청을 수행하기에 권한이 부족한 경우 */
    export type InsufficientPermissions = "INSUFFICIENT_PERMISSIONS";

    export type Token = Token.Expired | Token.Invalid;
    export namespace Token {
        /** 토큰이 만료된 경우 */
        export type Expired = "EXPIRED_TOKEN";
        /** 토큰이 비정상적인 경우 */
        export type Invalid = "INVALID_TOKEN";
    }

    export namespace User {
        export type NotFound = "NOT_FOUND_USER";
        export type AlreadyExist = "ALREADY_EXIST_USER";
    }

    export namespace Article {
        export type NotFound = "NOT_FOUND_ARTICLE";
    }

    export namespace Comment {
        export type NotFound = "NOT_FOUND_COMMENT";
    }
}
