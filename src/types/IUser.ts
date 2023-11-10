import typia from "typia";

export interface IUser {
    id: string & typia.tags.Format<"uuid">;
    name: string;
    image_url: (string & typia.tags.Format<"url">) | null;
    introduction: string;
    created_at: string & typia.tags.Format<"date-time">;
    updated_at: (string & typia.tags.Format<"date-time">) | null;
}

export namespace IUser {
    export interface Identity {
        user_id: string & typia.tags.Format<"uuid">;
    }

    export interface IDeletedAuthor {
        status: "deleted";
    }
    export interface IActiveAuthor
        extends Pick<IUser, "id" | "name" | "image_url"> {
        status: "active";
    }
    export type IAuthor = IDeletedAuthor | IActiveAuthor;
}
