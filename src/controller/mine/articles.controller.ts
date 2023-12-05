import core from "@nestia/core";
import * as nest from "@nestjs/common";
import { Request } from "express";
import typia from "typia";

import { MineArticlesUsecase } from "@APP/application/mine/articles.usecase";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

@nest.Controller("mine/articles")
export class MineArticlesController {
    /**
     * 작성자 권한으로 게시글 목록을 불러옵니다.
     *
     * @summary 내가 쓴 게시글 모아 보기
     * @tag mine
     * @security bearer
     * @param query 필터링 및 정렬 조건
     * @return 내가 쓴 게시글 목록
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedRoute.Get()
    async getList(
        @core.TypedQuery() query: IArticle.IBulk.ISearch,
        @nest.Request() req: Request,
    ): Promise<IArticle.IBulk.IPaginated> {
        const result = await MineArticlesUsecase.getList(req)(query);
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
            }
        throw Failure.Http.fromExternal(error);
    }

    /**
     * 작성자 권한으로 게시글 상세 정보를 볼 수 있습니다.
     *
     * @summary 게시글 상세 보기
     * @tag mine
     * @security bearer
     * @param article_id 게시글 id
     * @return 게시글 상세 정보
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get(":article_id")
    async get(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @nest.Request() req: Request,
    ): Promise<IArticle> {
        const result = await MineArticlesUsecase.get(req)({ article_id });
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
                case "NOT_FOUND_ARTICLE":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }

    /**
     * 작성자 권한으로 게시글을 수정합니다.
     *
     * @summary 게시글 수정
     * @tag mine
     * @security bearer
     * @param article_id 게시글 id
     * @param body 게시글 수정 사항
     * @return 수정된 게시글 식별자
     */
    @core.TypedException<
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
        | ErrorCode.Permission.Required
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<
        ErrorCode.Article.NotFound | ErrorCode.Attachment.NotFound
    >(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Put(":article_id")
    async update(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IArticle.IUpdateBody,
        @nest.Request() req: Request,
    ): Promise<IArticle.Identity> {
        const result = await MineArticlesUsecase.update(req)({
            article_id,
        })(body);
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        if (error instanceof Error)
            switch (error.message) {
                case "EXPIRED_PERMISSION":
                case "INVALID_PERMISSION":
                case "REQUIRED_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.UNAUTHORIZED,
                    );
                case "INSUFFICIENT_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.FORBIDDEN,
                    );
                case "NOT_FOUND_ARTICLE":
                case "NOT_FOUND_ATTACHMENT":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }

    /**
     * 작성자 권한으로 게시글을 삭제합니다.
     *
     * @summary 게시글 삭제
     * @tag mine
     * @security bearer
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
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Delete(":article_id")
    async remove(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @nest.Request() req: Request,
    ): Promise<IArticle.Identity> {
        const result = await MineArticlesUsecase.remove(req)({
            article_id,
        });
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        if (error instanceof Error)
            switch (error.message) {
                case "EXPIRED_PERMISSION":
                case "INVALID_PERMISSION":
                case "REQUIRED_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.UNAUTHORIZED,
                    );
                case "INSUFFICIENT_PERMISSION":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.FORBIDDEN,
                    );
                case "NOT_FOUND_ARTICLE":
                    throw Failure.Http.fromInternal(
                        error,
                        nest.HttpStatus.NOT_FOUND,
                    );
            }
        throw Failure.Http.fromExternal(error);
    }
}
