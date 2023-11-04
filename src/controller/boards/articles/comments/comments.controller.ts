import core from "@nestia/core";
import * as nest from "@nestjs/common";
import typia from "typia";

import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";

@nest.Controller("boards/:board_id/articles/:article_id/comments")
export class BoardsArticlesCommentsController {
    /**
     * 게시글의 댓글 혹은 답글 목록을 조회합니다.
     *
     * 만약 쿼리로 parent_id를 추가하면 해당 댓글의 답글을 불러옵니다.
     *
     * @summary 게시글 댓글 혹은 답글 목록 조회
     * @tag comments
     * @security bearer
     * @param board_id 게시판 id
     * @param article_id 게시글 id
     * @param query 필터링 및 정렬 조건
     * @return 댓글 목록
     */
    @core.TypedException<
        ErrorCode.Permission.Expired | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Board.NotFound | ErrorCode.Article.NotFound>(
        nest.HttpStatus.NOT_FOUND,
    )
    @core.TypedRoute.Get()
    getList(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedQuery() query: IComment.ISearch,
    ): Promise<IComment.IPaginated> {
        board_id;
        article_id;
        query;
        throw Error();
    }

    /**
     * 게시글의 댓글을 조회합니다.
     *
     * @summary 게시글 댓글 조회
     * @tag comments
     * @security bearer
     * @param board_id 게시판 id
     * @param article_id 게시글 id
     * @param comment_id 댓글 id
     * @return 댓글 상세 정보
     */
    @core.TypedException<
        ErrorCode.Permission.Expired | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<
        | ErrorCode.Board.NotFound
        | ErrorCode.Article.NotFound
        | ErrorCode.Comment.NotFound
    >(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get(":comment_id")
    get(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
    ): Promise<IComment> {
        board_id;
        article_id;
        comment_id;
        throw Error();
    }

    /**
     * 게시글의 댓글을 생성합니다.
     *
     * @summary 게시글 댓글 생성
     * @tag comments
     * @security bearer
     * @param board_id 게시판 id
     * @param article_id 게시글 id
     * @param body 댓글 생성 정보
     * @return 생성된 댓글 식별자
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Board.NotFound | ErrorCode.Article.NotFound>(
        nest.HttpStatus.NOT_FOUND,
    )
    @core.TypedRoute.Post()
    create(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IComment.ICreateBody,
    ): Promise<IComment.Identity> {
        board_id;
        article_id;
        body;
        throw Error();
    }

    /**
     * 게시글의 댓글을 수정합니다.
     *
     * @summary 게시글 댓글 수정
     * @tag comments
     * @security bearer
     * @param board_id 게시판 id
     * @param article_id 게시글 id
     * @param comment_id 댓글 id
     * @param body 댓글 수정 정보
     * @return 수정된 댓글 식별자
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<
        | ErrorCode.Board.NotFound
        | ErrorCode.Article.NotFound
        | ErrorCode.Comment.NotFound
    >(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Put(":comment_id")
    update(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IComment.IUpdateBody,
    ): Promise<IComment.Identity> {
        board_id;
        article_id;
        comment_id;
        body;
        throw Error();
    }

    /**
     * 게시글의 댓글을 삭제합니다.
     *
     * @summary 게시글 댓글 삭제
     * @tag comments
     * @security bearer
     * @param board_id 게시판 id
     * @param article_id 게시글 id
     * @param comment_id 댓글 id
     * @return 삭제된 댓글 식별자
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<
        | ErrorCode.Board.NotFound
        | ErrorCode.Article.NotFound
        | ErrorCode.Comment.NotFound
    >(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Delete(":comment_id")
    remove(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
    ): Promise<IComment.Identity> {
        board_id;
        article_id;
        comment_id;
        throw Error();
    }
}