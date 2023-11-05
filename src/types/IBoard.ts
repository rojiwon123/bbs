import typia from "typia";

import { IMembership } from "./IMembership";
import { Omit } from "./global";

export interface IBoard {
    id: string & typia.tags.Format<"uuid">;
    /** 게시판 이름 */
    name: string;
    /** 게시판 소개글 */
    description: string;

    /** 게시글 목록 불러오기 요청 수행 최소권한 */
    read_article_list_membership: IMembership | null;
    /** 게시글 읽기 요청 수행 최소권한 */
    read_article_membership: IMembership | null;
    /** 댓글 목록 읽기 요청 수행 최소권한 */
    read_comment_list_membership: IMembership | null;

    /** 게시글 생성 요청 수행 최소권한 */
    write_article_membership: IMembership;
    /** 댓글 생성 요청 수행 최소권한 */
    write_comment_membership: IMembership;

    /** 매니저 요청 수행 최소권한 */
    manager_membership: IMembership;
}

export namespace IBoard {
    export interface Identity {
        board_id: string & typia.tags.Format<"uuid">;
    }
    export interface ISummary extends Pick<IBoard, "id" | "name"> {}

    export interface IUpdate
        extends Pick<IBoard, "id" | "name" | "description"> {
        read_article_list_membership_id:
            | (string & typia.tags.Format<"uuid">)
            | null;
        read_article_membership_id: (string & typia.tags.Format<"uuid">) | null;
        read_comment_list_membership_id:
            | (string & typia.tags.Format<"uuid">)
            | null;

        write_article_membership_id: string & typia.tags.Format<"uuid">;
        write_comment_membership_id: string & typia.tags.Format<"uuid">;

        manager_membership_id: string & typia.tags.Format<"uuid">;
    }
    export interface ICreate extends Omit<IUpdate, "id"> {}

    export interface IUpdateBody {}
    export interface ICreateBody {}
}
