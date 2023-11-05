import typia from "typia";

import { ArticleBodyFormat } from "../../db/edge";
import { IBoard } from "./IBoard";
import { IPage } from "./IPage";
import { IUser } from "./IUser";
import { Omit } from "./global";

export interface IArticle {
    id: string & typia.tags.Format<"uuid">;
    /** 게시글 제목 */
    title: string | null;
    /** 게시글 본문 */
    body: IArticle.IBody | null;
    /** 작성자 정보 */
    author: IArticle.IAuthor;
    /** 소속 게시판 정보 */
    board: IBoard.ISummary;
    /** 공지 여부 */
    is_notice: boolean;
    created_at: string & typia.tags.Format<"date-time">;
    updated_at: (string & typia.tags.Format<"date-time">) | null;
}

export namespace IArticle {
    export type BodyFormat = ArticleBodyFormat;

    export interface IBody {
        url: string & typia.tags.Format<"url">;
        format: BodyFormat;
    }
    export interface Identity {
        article_id: string & typia.tags.Format<"uuid">;
    }

    export interface ISummary
        extends Pick<
            IArticle,
            "id" | "title" | "author" | "created_at" | "updated_at"
        > {}

    export interface IDeletedAuthor {
        status: "deleted";
    }

    export interface IActiveAuthor extends IUser.ISummary {
        status: "active";
    }

    export type IAuthor = IDeletedAuthor | IActiveAuthor;

    export interface IUpdate
        extends Pick<IArticle, "id" | "is_notice">,
            IArticle.IBody {
        /** 게시글 제목 */
        title: string;
    }

    export interface ICreate extends Omit<IUpdate, "id"> {
        author_id: string & typia.tags.Format<"uuid">;
        board_id: string & typia.tags.Format<"uuid">;
    }

    export interface ISearch extends IPage.ISearch {
        /** @default latest */
        sort?: IPage.SortType;
    }

    export interface IPaginated extends IPage.IResponse<ISummary> {}

    export interface IUpdateBody extends Omit<IUpdate, "id" | "is_notice"> {}

    export interface ICreateBody
        extends Omit<ICreate, "author_id" | "board_id" | "is_notice"> {}
}
