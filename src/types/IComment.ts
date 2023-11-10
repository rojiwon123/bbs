import typia from "typia";

import { IArticle } from "./IArticle";
import { IPage } from "./IPage";
import { IUser } from "./IUser";

export interface IComment {
    id: string & typia.tags.Format<"uuid">;
    author: IUser.IAuthor;
    snapshots: IComment.ISnapshot[] & typia.tags.MinItems<1>;
    created_at: string & typia.tags.Format<"date-time">;
}

export namespace IComment {
    export interface Identity {
        comment_id: string & typia.tags.Format<"uuid">;
    }

    export interface IUpdate extends ISnapshot.ICreate {}
    export interface ICreate extends IUpdate, IArticle.Identity {}
    export interface ISnapshot {
        body: string;
        created_at: string & typia.tags.Format<"date-time">;
    }

    export namespace ISnapshot {
        export interface ICreate extends Pick<ISnapshot, "body"> {}
    }

    export interface ISearch extends IPage.ISearch, IArticle.Identity {}
    export interface IPaginatedResponse extends IPage.IResponse<IComment> {}
}
