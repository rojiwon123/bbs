import { IMembership } from "./IMembership";
import { Omit, Regex } from "./global";

export interface IUser {
    id: Regex.UUID;
    /** 프로필 이미지 주소 */
    image_url: Regex.URL | null;
    /** 사용자명 */
    name: string;
    /** 사용자 멤버십 등급 */
    membership: IMembership | null;
    created_at: Regex.DateTime;
    updated_at: Regex.DateTime | null;
}

export namespace IUser {
    export interface Identity {
        user_id: Regex.UUID;
    }

    export interface ISummary
        extends Pick<IUser, "id" | "name" | "image_url" | "membership"> {}

    export interface IUpdate extends Pick<IUser, "id" | "name" | "image_url"> {
        membership_id: Regex.UUID | null;
    }
    export interface ICreate extends Omit<IUpdate, "id"> {}

    export interface IUpdateBody
        extends Omit<IUpdate, "id" | "membership_id"> {}
    export interface ICreateBody extends Omit<ICreate, "membership_id"> {}
}
