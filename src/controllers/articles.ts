import core from "@nestia/core";
import * as nest from "@nestjs/common";
import typia from "typia";

import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";

@nest.Controller("boards/:board_id/articles")
export class BoardsArticlesController {
    /**
     * 게시판 내 게시글 요약 목록을 요청합니다.
     *
     * @summary 게시판 게시글 목록 조회
     * @tag articles
     * @security bearer
     * @param board_id 게시판 id
     * @param query 필터링 및 정렬 조건
     * @return 게시글 목록
     */
    @core.TypedException<
        ErrorCode.Permission.Expired | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Board.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get()
    getList(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedQuery() query: IArticle.ISearch,
    ): Promise<IArticle.IPaginated> {
        board_id;
        query;
        throw Error();
    }

    /**
     * 게시판 게시글 상세 조회
     *
     * @summary 게시글 상세 조회
     * @tag articles
     * @security bearer
     * @param board_id 게시판 id
     * @param article_id 게시글 id
     * @return 게시글 상세 정보
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
    @core.TypedRoute.Get(":article_id")
    get(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
    ): Promise<IArticle> {
        board_id;
        article_id;
        throw Error();
    }

    /**
     * 게시판내 새로운 게시글을 생성합니다.
     *
     * @summary 게시글 생성
     * @tag articles
     * @security bearer
     * @param board_id 게시판 id
     * @param body 게시글 생성 정보
     * @return 생성된 게시글 식별자
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Board.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Post()
    create(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IArticle.ICreateBody,
    ): Promise<IArticle.Identity> {
        board_id;
        body;
        throw Error();
    }

    /**
     * 게시판 게시글을 수정합니다.
     *
     * @summary 게시글 수정
     * @tag articles
     * @security bearer
     * @param board_id 게시판 id
     * @param article_id 게시글 id
     * @param body 게시글 수정 사항
     * @return 수정된 게시글 식별자
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
    @core.TypedRoute.Put(":article_id")
    update(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IArticle.IUpdateBody,
    ): Promise<IArticle.Identity> {
        board_id;
        article_id;
        body;
        throw Error();
    }

    /**
     * 게시판 게시글을 삭제합니다.
     *
     * @summary 게시글 삭제
     * @tag articles
     * @security bearer
     * @param board_id 게시판 id
     * @param article_id 게시글 id
     * @return 삭제된 게시글 식별자
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
    @core.TypedRoute.Delete(":article_id")
    remove(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
    ): Promise<IArticle.Identity> {
        board_id;
        article_id;
        throw Error();
    }
}
