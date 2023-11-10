import core from "@nestia/core";
import * as nest from "@nestjs/common";
import { Request } from "express";
import typia from "typia";

import { BoardsCommentsUsecase } from "@APP/application/boards/comments.usecase";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

@nest.Controller("boards/:board_id/articles/:article_id/comments")
export class BoardsArticlesCommentsController {
    /**
     * 게시판 권한으로 댓글 목록을 불러옵니다.
     *
     * 만약 쿼리로 parent_id를 추가하면 해당 댓글의 답글만 불러옵니다.
     *
     * @summary 댓글 목록 보기
     * @tag boards
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
    async getList(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedQuery() query: IComment.ISearch,
        @nest.Request() req: Request,
    ): Promise<IComment.IPaginated> {
        const result = await BoardsCommentsUsecase.getList(req)({
            board_id,
            article_id,
        })(query);
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        if (error instanceof Error)
            switch (error.message) {
                case "EXPIRED_PERMISSION":
                case "INVALID_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.UNAUTHORIZED,
                    );
                case "INSUFFICIENT_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.FORBIDDEN,
                    );
                case "NOT_FOUND_BOARD":
                case "NOT_FOUND_ARTICLE":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }

    /**
     * 게시판 권한으로 댓글 상세 정보를 볼 수 있습니다.
     *
     * @summary 댓글 상세 보기
     * @tag boards
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
    async get(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
        @nest.Request() req: Request,
    ): Promise<IComment> {
        const result = await BoardsCommentsUsecase.get(req)({
            board_id,
            article_id,
            comment_id,
        });
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        if (error instanceof Error)
            switch (error.message) {
                case "EXPIRED_PERMISSION":
                case "INVALID_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.UNAUTHORIZED,
                    );
                case "INSUFFICIENT_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.FORBIDDEN,
                    );
                case "NOT_FOUND_BOARD":
                case "NOT_FOUND_ARTICLE":
                case "NOT_FOUND_COMMENT":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }

    /**
     * 게시판 권한으로 댓글을 생성합니다.
     *
     * @summary 댓글 생성
     * @tag boards
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
    async create(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IComment.ICreateBody,
        @nest.Request() req: Request,
    ): Promise<IComment.Identity> {
        const result = await BoardsCommentsUsecase.create(req)({
            board_id,
            article_id,
        })(body);
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        if (error instanceof Error)
            switch (error.message) {
                case "REQUIRED_PERMISSION":
                case "EXPIRED_PERMISSION":
                case "INVALID_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.UNAUTHORIZED,
                    );
                case "INSUFFICIENT_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.FORBIDDEN,
                    );
                case "NOT_FOUND_BOARD":
                case "NOT_FOUND_ARTICLE":
                case "NOT_FOUND_COMMENT":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }
}
