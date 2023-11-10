import { Board } from "@APP/domain/board";
import { IBoard } from "@APP/types/IBoard";

export namespace BoardsUsecase {
    export const get = (identity: IBoard.Identity) =>
        Board.get()({ id: identity.board_id });
    export const getList = () => Board.getList()();
}
