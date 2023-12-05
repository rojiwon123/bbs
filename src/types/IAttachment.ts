import { Omit, Regex } from "./global";

export interface IAttachment {
    id: Regex.UUID;
    /**
     * 파일명
     *
     * 사용자가 해당 파일을 식별하기위해 사용하는 이름으로 사용자에게 해당 이름이 표시된다.
     *
     * url상에 파일명과 다를 수 있다. url상의 파일명은 서비스 내부 규칙에 의해 정해진다.
     */
    name: string;
    /**
     * 파일 확장자
     *
     * e.g., md, html, jpeg...
     */
    extension: string;
    /**
     * 실제 리소스의 주소
     *
     * 해당 주소는 변경될 수 있다.
     *
     * 예를 들어, 리소스 접근 권한이 필요한 경우 해당 권한이 부여된 url을 받게 될 것이다.
     */
    url: Regex.URL;
    created_at: Regex.DateTime;
}

export namespace IAttachment {
    export interface Identity {
        attachment_id: Regex.UUID;
    }
    export interface ICreate
        extends Pick<IAttachment, "name" | "extension" | "url"> {
        owner_id: Regex.UUID;
    }
    export interface IPresigned {
        attachment_id: Regex.UUID;
        presigned_url: Regex.URL;
    }
    export interface ICreateBody extends Omit<ICreate, "owner_id" | "url"> {}
}
