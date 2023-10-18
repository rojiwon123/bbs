import typia from "typia";

export interface IUser {
    id: string & typia.tags.Format<"uuid">;
    name: string;
    image_url: (string & typia.tags.Format<"url">) | null;
    introduction: string;
}
