import typia from "typia";

import { IOauth } from "./IOauth";
import { IToken } from "./IToken";

export interface IAuthentication {
    status: "active";
    access_token: IToken.IOutput;
}

export namespace IAuthentication {
    // 추후에 oauth 인증 -> 사용자 생성 단계를 분리하면 pending 상태가 추가됨
    // pending 상태일 때는 사용자 생성 권한 밖에 없음
    // pending 상태인 경우, oauth profile을 함께 리턴함
    // export type Type = "pending" | "active";
    export type IOauthUrls = Record<
        IOauth.Type,
        string & typia.tags.Format<"url">
    >;

    export interface IOauthInput {
        oauth_type: IOauth.Type;
        code: string;
    }
}
