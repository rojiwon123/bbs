import typia from "typia";

import { IArticle } from "./IArticle";
import { IPage } from "./IPage";
import { Omit } from "./global";

export interface IComment {
    id: string & typia.tags.Format<"uuid">;
    /** 댓글 본문 */
    body: string;
    /** 댓글 생성자 정보 */
    author: IArticle.IAuthor;
    /** 상위 댓글 정보 */
    parent: IComment.ISummary | null;
    /** 소속 게시글 정보 */
    article: IArticle.ISummary;
    created_at: string & typia.tags.Format<"date-time">;
    updated_at: (string & typia.tags.Format<"date-time">) | null;
}

export namespace IComment {
    export interface Identity {
        comment_id: string;
    }
    export interface ISummary
        extends Pick<
            IComment,
            "id" | "author" | "body" | "created_at" | "updated_at"
        > {}

    export interface IUpdate extends Pick<IComment, "id" | "body"> {}

    export interface ICreate extends Omit<IUpdate, "id"> {
        author_id: string & typia.tags.Format<"uuid">;
        parent_id: (string & typia.tags.Format<"uuid">) | null;
        article_id: string & typia.tags.Format<"uuid">;
    }

    export interface ISearch extends IPage.ISearch {
        parent_id?: string & typia.tags.Format<"uuid">;
        sort?: IPage.SortType;
    }

    export interface IPaginated extends IPage.IResponse<IComment.ISummary> {}

    export interface IUpdateBody extends Omit<IUpdate, "id"> {}
    export interface ICreateBody
        extends Omit<ICreate, "article_id" | "author_id" | "parent_id"> {}
}
