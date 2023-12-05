import typia from "typia";

import { ArticleBodyFormat } from "../../db/edge";
import { IAttachment } from "./IAttachment";
import { IBoard } from "./IBoard";
import { IPage } from "./IPage";
import { IUser } from "./IUser";
import { Omit, Regex } from "./global";

export interface IArticle {
    id: Regex.UUID;
    /** 게시글 제목 */
    title: string | null;
    /** 게시글 본문 */
    body: IArticle.IBody | null;
    /** 작성자 정보 */
    author: IArticle.IAuthor;
    /** 소속 게시판 정보 */
    board: IBoard.ISummary;
    /** 공지 여부 */
    notice: boolean;
    /** 첨부파일 목록 */
    attachments: IAttachment[];
    created_at: Regex.DateTime;
    updated_at: Regex.DateTime | null;
}

export namespace IArticle {
    export type BodyFormat = ArticleBodyFormat;

    export interface IBody {
        url: Regex.URL;
        format: BodyFormat;
    }

    export interface IDeletedAuthor {
        status: "deleted";
        id: Regex.UUID;
    }

    export interface IActiveAuthor extends IUser.ISummary {
        status: "active";
    }

    export type IAuthor = IDeletedAuthor | IActiveAuthor;

    export interface Identity {
        article_id: Regex.UUID;
    }

    export interface ISummary
        extends Pick<
            IArticle,
            "id" | "title" | "author" | "created_at" | "updated_at"
        > {}

    export interface IUpdate extends Pick<IArticle, "id">, IArticle.IBody {
        /** 게시글 제목 */
        title: string;
        attachment_ids: Regex.UUID[] & typia.tags.MaxItems<10>;
    }

    export interface ICreate extends Omit<IUpdate, "id"> {
        /** 공지 여부 */
        notice: boolean;
        author_id: Regex.UUID;
        board_id: Regex.UUID;
        attachment_ids: Regex.UUID[] & typia.tags.MaxItems<10>;
    }

    export interface ISetNoticeInput {
        board_id: Regex.UUID;
        article_ids: Regex.UUID[];
        notice: boolean;
    }

    export interface ISearch extends IPage.ISearch {
        /** @default latest */
        sort?: IPage.SortType;
    }

    export interface IPaginated extends IPage.IResponse<ISummary> {}

    export interface IUpdateBody extends Omit<IUpdate, "id"> {}

    export interface ICreateBody
        extends Omit<ICreate, "author_id" | "board_id" | "notice"> {}

    export interface ISetNoticeBody extends Omit<ISetNoticeInput, "board_id"> {}

    export interface IBulk
        extends Pick<
            IArticle,
            "id" | "title" | "board" | "created_at" | "updated_at"
        > {}

    export namespace IBulk {
        export interface ISearch extends IArticle.ISearch {
            board_id?: Regex.UUID;
        }
        export interface IPaginated extends IPage.IResponse<IBulk> {}
    }
}
