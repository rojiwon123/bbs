import typia from "typia";

import { IMembership } from "./IMembership";

export interface IUser {
    id: string & typia.tags.Format<"uuid">;
    /** 프로필 이미지 주소 */
    image_url: (string & typia.tags.Format<"url">) | null;
    /** 사용자명 */
    name: string;
    /** 사용자 멤버십 등급 */
    membership: IMembership | null;
    created_at: string & typia.tags.Format<"date-time">;
    updated_at: (string & typia.tags.Format<"date-time">) | null;
}

export namespace IUser {
    export interface Identity {
        user_id: string & typia.tags.Format<"uuid">;
    }
    export interface ISummary
        extends Pick<IUser, "id" | "name" | "image_url" | "membership"> {}
}
