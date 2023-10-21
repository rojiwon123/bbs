import typia from "typia";

import { ArticleBodyFormat } from "../../db/edge";
import { IPage } from "./IPage";
import "./IUser";
import { IUser } from "./IUser";

export interface IArticle {
    id: string & typia.tags.Format<"uuid">;
    author: IUser.IAuthor;
    snapshots: IArticle.ISnapshot[] & typia.tags.MinItems<1>;
    posted_at: string & typia.tags.Format<"date-time">;
}

export namespace IArticle {
    export type BodyFormat = ArticleBodyFormat;
    export interface ICreate extends ISnapshot.ICreate {}
    export interface Identity {
        article_id: string & typia.tags.Format<"uuid">;
    }

    export interface ISnapshot {
        title: string;
        body_url: string & typia.tags.Format<"url">;
        body_format: BodyFormat;
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
