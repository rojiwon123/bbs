import { IMembership } from "./IMembership";
import { Omit, Regex } from "./global";

export interface IBoard {
    id: Regex.UUID;
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
        board_id: Regex.UUID;
    }
    export interface ISummary extends Pick<IBoard, "id" | "name"> {}

    export interface IUpdate
        extends Pick<IBoard, "id" | "name" | "description"> {
        read_article_list_membership_id: Regex.UUID | null;
        read_article_membership_id: Regex.UUID | null;
        read_comment_list_membership_id: Regex.UUID | null;

        write_article_membership_id: Regex.UUID;
        write_comment_membership_id: Regex.UUID;

        manager_membership_id: Regex.UUID;
    }
    export interface ICreate extends Omit<IUpdate, "id"> {}

    export interface IUpdateBody {}
    export interface ICreateBody {}
}
