import { IArticle } from "./IArticle";
import { IPage } from "./IPage";
import { Omit, Regex } from "./global";

export interface IComment {
    id: Regex.UUID;
    /** 댓글 본문 */
    body: string | null;
    /** 댓글 생성자 정보 */
    author: IArticle.IAuthor;
    /** 상위 댓글 정보 */
    parent: IComment.ISummary | null;
    /** 소속 게시글 정보 */
    article: IArticle.ISummary;
    created_at: Regex.DateTime;
    updated_at: Regex.DateTime | null;
}

export namespace IComment {
    export interface Identity {
        comment_id: Regex.UUID;
    }
    export interface ISummary
        extends Pick<
            IComment,
            "id" | "author" | "body" | "created_at" | "updated_at"
        > {}

    export interface IUpdate extends Pick<IComment, "id"> {
        /** 댓글 본문 */
        body: string;
    }

    export interface ICreate extends Omit<IUpdate, "id"> {
        author_id: Regex.UUID;
        parent_id: Regex.UUID | null;
        article_id: Regex.UUID;
    }

    export interface ISearch extends IPage.ISearch {
        parent_id?: Regex.UUID;
        sort?: IPage.SortType;
    }

    export interface IPaginated extends IPage.IResponse<IComment.ISummary> {}

    export interface IUpdateBody extends Omit<IUpdate, "id"> {}
    export interface ICreateBody
        extends Omit<ICreate, "article_id" | "author_id"> {}

    export interface IBulk
        extends Pick<
            IComment,
            "id" | "body" | "article" | "parent" | "created_at" | "updated_at"
        > {}

    export namespace IBulk {
        export interface ISearch extends IComment.ISearch {
            article_id?: Regex.UUID;
        }
        export interface IPaginated extends IPage.IResponse<IBulk> {}
    }
}
