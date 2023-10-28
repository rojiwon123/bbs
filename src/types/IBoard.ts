import typia from "typia";

import "./IMembership";
import { IMembership } from "./IMembership";

export interface IBoard {
    id: string & typia.tags.Format<"uuid">;
    /** 게시판 이름 */
    name: string;
    /** 게시판 소개글 */
    description: string;

    /** 매니저 요청 수행 최소권한 */
    manager_membership: IMembership;

    /** 게시글 목록 불러오기 요청 수행 최소권한 */
    read_article_list_membership: IMembership | null;
    /** 게시글 읽기 요청 수행 최소권한 */
    read_article_membership: IMembership | null;
    /** 댓글 (및 목록) 읽기 요청 수행 최소권한 */
    read_comment_membership: IMembership | null;

    /** 게시글 생성 요청 수행 최소권한 */
    write_article_membership: IMembership;
    /** 댓글 생성 요청 수행 최소권한 */
    write_comment_merbership: IMembership;
}

export namespace IBoard {
    export interface ISummary extends Pick<IBoard, "id" | "name"> {}
}
