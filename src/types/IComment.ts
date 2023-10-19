import typia from "typia";

import { IPage } from "./IPage";
import { IUser } from "./IUser";

export interface IComment {
    id: string & typia.tags.Format<"uuid">;
    author: IComment.IAuthor;
    snapshots: IComment.ISnapshot[] & typia.tags.MinItems<1>;
    created_at: string & typia.tags.Format<"date-time">;
}

export namespace IComment {
    export interface ICreate extends ISnapshot.ICreate {}
    export interface IAuthor extends Pick<IUser, "id" | "image_url" | "name"> {}
    export interface ISnapshot {
        id: string & typia.tags.Format<"uuid">;
        body: string;
        created_at: string & typia.tags.Format<"date-time">;
    }

    export namespace ISnapshot {
        export interface ICreate extends Pick<ISnapshot, "body"> {}
    }

    export interface ISearch extends IPage.ISearch {}
    export interface IPaginatedResponse extends IPage.IResponse<IComment> {}
}
