import core from "@nestia/core";
import * as nest from "@nestjs/common";
import typia from "typia";

import { BoardsUsecase } from "@APP/application/boards/boards.usecase";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IBoard } from "@APP/types/IBoard";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

@nest.Controller("boards")
export class BoardsController {
    /**
     * 게시판 목록 조회
     *
     * @summary 게시판 목록 조회
     * @tag public
     * @return 게시판 목록
     */
    @core.TypedRoute.Get()
    async getList(): Promise<IBoard.ISummary[]> {
        const result = await BoardsUsecase.getList();
        return Result.Ok.flatten(result);
    }

    /**
     * 게시판 조회
     *
     * @summary 게시판 조회
     * @tag public
     * @return 게시판 상세 정보
     */
    @core.TypedException<ErrorCode.Board.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get(":board_id")
    async get(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
    ): Promise<IBoard> {
        const result = await BoardsUsecase.get({ board_id });
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        throw Failure.Http.fromInternal(error, nest.HttpStatus.NOT_FOUND);
    }
}
