import core from "@nestia/core";
import * as nest from "@nestjs/common";
import typia from "typia";

import { Comment } from "@APP/app/comment";
import { Security } from "@APP/app/security";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

@nest.Controller("articles/:article_id/comments")
export class CommentsController {
    /**
     * get comment list by filtering and sorting options.
     *
     * @summary get comment list
     * @tag comments
     * @param query filtering and sorting options
     * @return paginated comment list
     */
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get()
    async getList(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedQuery() query: IComment.ISearch,
    ): Promise<IComment.IPaginatedResponse> {
        const result = await Comment.getList()({ article_id })(query);
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);

        const error = Result.Error.flatten(result);
        switch (error.message) {
            case "NOT_FOUND_ARTICLE":
                throw Failure.Http.fromInternal(
                    error,
                    nest.HttpStatus.NOT_FOUND,
                );
        }
    }

    /**
     * create a new comment, the comment have one snapshot.
     *
     * @summary create a new comment
     * @tag comments
     * @security bearer
     * @param body comment content
     * @return created comment
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED, "PERMISSION DENIED")
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Post()
    async create(
        @Security.HttpBearer() security: Security,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IComment.ICreate,
    ): Promise<IComment.Identity> {
        const token = Security.required(security);
        const identity = await Security.verify()(token);
        const result = await Comment.create()(identity)({ article_id })(body);
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);

        const error = Result.Error.flatten(result);
        switch (error.message) {
            case "NOT_FOUND_ARTICLE":
                throw Failure.Http.fromInternal(
                    error,
                    nest.HttpStatus.NOT_FOUND,
                );
        }
    }

    /**
     * update a specific comment found by comment id
     *
     * only the author can update the comment
     *
     * @summary update a comment
     * @tag comments
     * @security bearer
     * @param comment_id identity of comment
     * @param body update content of comment
     * @return updated comment
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED, "PERMISSION DENIED")
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Comment.NotFound>(nest.HttpStatus.NOT_FOUND)
    @nest.HttpCode(nest.HttpStatus.CREATED)
    @core.TypedRoute.Put(":comment_id")
    async update(
        @Security.HttpBearer() security: Security,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IComment.ICreate,
    ): Promise<IComment.Identity> {
        const token = Security.required(security);
        const identity = await Security.verify()(token);
        const result = await Comment.update()(identity)({
            article_id,
            comment_id,
        })(body);
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);

        const error = Result.Error.flatten(result);
        switch (error.message) {
            case "INSUFFICIENT_PERMISSION":
                throw Failure.Http.fromInternal(
                    error,
                    nest.HttpStatus.FORBIDDEN,
                );
            case "NOT_FOUND_COMMENT":
                throw Failure.Http.fromInternal(
                    error,
                    nest.HttpStatus.NOT_FOUND,
                );
        }
    }

    /**
     * delete a specific comment found by comment id
     *
     * only the author can delete the comment
     *
     * @summary delete a comment
     * @tag comments
     * @security bearer
     * @param comment_id identity of comment
     * @return none
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED, "PERMISSION DENIED")
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Comment.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Delete(":comment_id")
    async remove(
        @Security.HttpBearer() security: Security,
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
    ): Promise<IComment.Identity> {
        const token = Security.required(security);
        const identity = await Security.verify()(token);
        const result = await Comment.remove()(identity)({
            article_id,
            comment_id,
        });
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);

        const error = Result.Error.flatten(result);
        switch (error.message) {
            case "INSUFFICIENT_PERMISSION":
                throw Failure.Http.fromInternal(
                    error,
                    nest.HttpStatus.FORBIDDEN,
                );
            case "NOT_FOUND_COMMENT":
                throw Failure.Http.fromInternal(
                    error,
                    nest.HttpStatus.NOT_FOUND,
                );
        }
    }
}
