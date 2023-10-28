import typia from "typia";

import { ArticleBodyFormat } from "../../db/edge";
import { IBoard } from "./IBoard";
import { IPage } from "./IPage";
import { IUser } from "./IUser";

export interface IArticle {
    id: string & typia.tags.Format<"uuid">;
    /** 게시글 제목 */
    title: string;
    /** 본문 주소 */
    body_url: string & typia.tags.Format<"url">;
    /** 본문 형식 */
    body_format: IArticle.BodyFormat;
    /** 작성자 정보 */
    author: IUser.ISummary;
    /** 소속 게시판 정보 */
    board: IBoard.ISummary;
    /** 공지 여부 */
    is_notice: boolean;
    created_at: string & typia.tags.Format<"date-time">;
    updated_at: (string & typia.tags.Format<"date-time">) | null;
}

export namespace IArticle {
    export type BodyFormat = ArticleBodyFormat;

    export interface Identity {
        article_id: string & typia.tags.Format<"uuid">;
    }

    export interface ISummary
        extends Pick<
            IArticle,
            "id" | "title" | "author" | "created_at" | "updated_at"
        > {}

    export interface ISearch extends IPage.ISearch {
        /** @default latest */
        sort?: IPage.SortType;
    }
    export interface IPaginated extends IPage.IResponse<ISummary> {}

    export interface IUpdate
        extends Pick<IArticle, "title" | "body_format" | "body_url"> {}

    export interface ICreate extends IUpdate {}
}
