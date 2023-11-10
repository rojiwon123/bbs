import typia from "typia";

export namespace IToken {
    export interface IPayload {
        /** 토큰 유형 */
        type: "access";
        /** 사용자 id */
        user_id: string & typia.tags.Format<"uuid">;
        /** 토큰 만료일자 */
        expired_at: string & typia.tags.Format<"date-time">;
    }
    export type IInput = Pick<IPayload, "user_id">;
    export interface IOutput {
        token: string;
        /** 토큰 만료일자 */
        expired_at: string & typia.tags.Format<"date-time">;
    }
}
