import core from "@nestia/core";
import * as nest from "@nestjs/common";
import typia from "typia";

import { ErrorCode } from "@APP/types/ErrorCode";
import { IBoard } from "@APP/types/IBoard";

@nest.Controller("boards")
export class BoardsController {
    /**
     * @summary 게시판 목록 조회
     * @tag boards
     * @return 게시판 목록
     */
    @core.TypedRoute.Get()
    getList(): Promise<IBoard[]> {
        throw Error();
    }

    /**
     * @summary 게시판 조회
     * @tag boards
     * @return 게시판 상세 정보
     */
    @core.TypedException<ErrorCode.Board.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get(":board_id")
    get(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
    ): Promise<IBoard> {
        board_id;
        throw Error();
    }

    /** 서비스 관리자 API
    @core.TypedRoute.Post()
    create() {}

    @core.TypedRoute.Put(":board_id")
    update(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
    ) {}

    @core.TypedRoute.Delete(":board_id")
    remove(
        @core.TypedParam("board_id")
        board_id: string & typia.tags.Format<"uuid">,
    ) {}
    */
}
