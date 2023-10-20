export namespace ErrorCode {
    /**
     * body, query, param 등 사용자로부터 얻은 데이터의 형식이 올바르지 않은 경우
     */
    export type InvalidInput = "INVALID_INPUT";
    /** oauth 인증이 실패하는 경우 */
    export type Authentication = "AUTHENTICATION_FAIL";

    export namespace Permission {
        /** 권한이 누락된 경우 - 401 */
        export type Required = "REQUIRED_PERMISSION";
        /** 권한이 부족한 경우 - 403 */
        export type Insufficient = "INSUFFICIENT_PERMISSION";
        /** 권한이 만료된 경우 - 401 */
        export type Expired = "EXPIRED_PERMISSION";
        /** 권한이 비정상적인 경우 - 401 */
        export type Invalid = "INVALID_PERMISSION";
    }

    export namespace User {
        export type NotFound = "NOT_FOUND_USER";
        export type AlreadyExist = "ALREADY_EXIST_USER";
        export type Invalid = "INVALID_USER";
    }

    export namespace Article {
        export type NotFound = "NOT_FOUND_ARTICLE";
    }

    export namespace Comment {
        export type NotFound = "NOT_FOUND_COMMENT";
    }
}
