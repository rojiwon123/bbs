import core from "@nestia/core";
import * as nest from "@nestjs/common";
import { Request } from "express";
import typia from "typia";

import { BoardsArticlesUsecase } from "@APP/application/boards/articles.usecase";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

@nest.Controller("boards/:board_id/articles")
export class BoardsArticlesController {
    /**
     * 게시판 권한으로 게시글 목록을 불러옵니다.
     *
     * @summary 게시글 목록 보기
     * @tag boards
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
    async getList(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedQuery() query: IArticle.ISearch,
        @nest.Request() req: Request,
    ): Promise<IArticle.IPaginated> {
        const result = await BoardsArticlesUsecase.getList(req)({ board_id })(
            query,
        );
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
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }

    /**
     * 게시판 권한으로 게시글 상세 정보를 볼 수 있습니다.
     *
     * @summary 게시글 상세 보기
     * @tag boards
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
    async get(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @nest.Request() req: Request,
    ): Promise<IArticle> {
        const result = await BoardsArticlesUsecase.get(req)({
            board_id,
            article_id,
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
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }

    /**
     * 게시판 권한으로 게시글을 생성합니다.
     *
     * @summary 게시글 생성
     * @tag boards
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
    async create(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IArticle.ICreateBody,
        @nest.Request() req: Request,
    ): Promise<IArticle.Identity> {
        const result = await BoardsArticlesUsecase.create(req)({ board_id })(
            body,
        );
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
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }
}
