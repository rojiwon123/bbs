import typia from "typia";

import { ArticleBodyFormat } from "../../db/edge";
import { IPage } from "./IPage";
import { IUser } from "./IUser";

export interface IArticle {
    id: string & typia.tags.Format<"uuid">;
    author: IArticle.IAuthor;
    snapshots: IArticle.ISnapshot[] & typia.tags.MinItems<1>;
    posted_at: string & typia.tags.Format<"date-time">;
}

export namespace IArticle {
    export interface ICreate extends ISnapshot.ICreate {}
    export interface IAuthor extends Pick<IUser, "id" | "image_url" | "name"> {}
    export interface ISnapshot {
        title: string;
        body_url: string;
        body_format: ArticleBodyFormat;
        created_at: string & typia.tags.Format<"date-time">;
    }

    export namespace ISnapshot {
        export interface ICreate
            extends Pick<ISnapshot, "title" | "body_format" | "body_url"> {}
    }

    export interface ISummary
        extends Pick<IArticle, "id" | "author" | "posted_at">,
            Pick<ISnapshot, "title"> {
        updated_at: (string & typia.tags.Format<"date-time">) | null;
    }

    export interface ISearch extends IPage.ISearch {
        /** @default desc */
        posted_at?: IPage.SortType;
    }
    export interface IPaginatedResponse extends IPage.IResponse<ISummary> {}
}
