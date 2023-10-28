import typia from "typia";

import { IArticle } from "./IArticle";
import { IPage } from "./IPage";
import { IUser } from "./IUser";

export interface IComment {
    id: string & typia.tags.Format<"uuid">;
    /** 댓글 본문 */
    body: string;
    /** 댓글 생성자 정보 */
    author: IUser.ISummary;
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

    export interface ISearch extends IPage.ISearch {
        parent_id?: string & typia.tags.Format<"uuid">;
        sort?: IPage.SortType;
    }

    export interface IPaginated extends IPage.IResponse<IComment.ISummary> {}

    export interface IUpdate extends Pick<IComment, "body"> {}

    export interface ICreate extends IUpdate {}
}
