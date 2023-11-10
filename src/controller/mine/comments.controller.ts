import core from "@nestia/core";
import * as nest from "@nestjs/common";
import { Request } from "express";
import typia from "typia";

import { ErrorCode } from "@APP/types/ErrorCode";
import { IComment } from "@APP/types/IComment";

@nest.Controller("mine/comments")
export class MineCommentsController {
    /**
     * 작성자 권한으로 댓글 목록을 불러옵니다.
     *
     * @summary 내가 쓴 댓글 모아 보기
     * @tag mine
     * @security bearer
     * @param query 필터링 및 정렬 조건
     * @return 내가 쓴 댓글 목록
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
        @core.TypedQuery() query: IComment.IBulk.ISearch,
        @nest.Request() req: Request,
    ): Promise<IComment.IBulk.IPaginated> {
        query;
        req;
        throw Error();
    }

    /**
     * 작성자 권한으로 댓글 상세 정보를 볼 수 있습니다.
     *
     * @summary 댓글 상세 보기
     * @tag mine
     * @security bearer
     * @param comment_id 댓글 id
     * @return 댓글 상세 정보
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Comment.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get(":comment_id")
    async get(
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
        @nest.Request() req: Request,
    ): Promise<IComment> {
        comment_id;
        req;
        throw Error();
    }

    /**
     * 작성자 권한으로 게시글을 수정합니다.
     *
     * @summary 댓글 수정
     * @tag mine
     * @security bearer
     * @param comment_id 댓글 id
     * @param body 댓글 수정 사항
     * @return 수정된 댓글 식별자
     */
    @core.TypedException<
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
        | ErrorCode.Permission.Required
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Comment.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Put(":comment_id")
    async update(
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IComment.IUpdateBody,
        @nest.Request() req: Request,
    ): Promise<IComment.Identity> {
        comment_id;
        body;
        req;
        throw Error("");
    }

    /**
     * 작성자 권한으로 댓글을 삭제합니다.
     *
     * @summary 게시글 삭제
     * @tag mine
     * @security bearer
     * @param comment_id 게시글 id
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
    @core.TypedException<ErrorCode.Comment.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Delete(":comment_id")
    async remove(
        @core.TypedParam("comment_id")
        comment_id: string & typia.tags.Format<"uuid">,
        @nest.Request() req: Request,
    ): Promise<IComment.Identity> {
        comment_id;
        req;
        throw Error();
    }
}
