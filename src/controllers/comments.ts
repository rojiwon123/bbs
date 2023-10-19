import core from "@nestia/core";
import * as nest from "@nestjs/common";
import typia from "typia";

import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";

@nest.Controller("articles/:article_id/comments")
export class CommentsController {
    /**
     * get comment list by filtering and sorting options.
     *
     * @summary get comment list
     * @tag articles
     * @tag comments
     * @param query filtering and sorting options
     * @return paginated comment list
     */
    @core.TypedRoute.Get()
    getList(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedQuery() query: IComment.ISearch,
    ): Promise<IComment.IPaginatedResponse> {
        article_id;
        query;
        throw Error();
    }

    /**
     * create a new comment, the comment have one snapshot.
     *
     * @summary create a new comment
     * @tag articles
     * @tag comments
     * @security bearer
     * @param body comment content
     * @return created comment
     */
    @core.TypedRoute.Post()
    create(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IComment.ICreate,
    ): Promise<IComment> {
        article_id;
        body;
        throw Error("");
    }
}

@nest.Controller("comments/:comment_id")
export class CommentController {
    /**
     * get a specific comment by comment id
     *
     * @summary find a comment
     * @tag comments
     * @param comment_id identity of comment
     * @return found comment
    @core.TypedException<ErrorCode.Comment.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get()
    async getOne(
        @core.TypedParam("comment_id") comment_id: string,
        ): Promise<IComment> {
            comment_id;
            throw Error("");
        }
    */

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
    @core.TypedException<ErrorCode.InsufficientPermissions>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Comment.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Put()
    async update(
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IComment.ICreate,
    ): Promise<IComment> {
        comment_id;
        body;
        throw Error("");
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
    @core.TypedException<ErrorCode.InsufficientPermissions>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Comment.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Delete()
    async remove(
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
    ): Promise<void> {
        comment_id;
        throw Error("");
    }
}
