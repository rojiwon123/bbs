import core from "@nestia/core";
import * as nest from "@nestjs/common";
import { Request } from "express";

import { IAttachment } from "@APP/types/IAttachment";

@nest.Controller("mine/attachments")
export class MineAttachmentsController {
    /**
     * 게시글 파일 첨부를 위해 첨부 파일 식별자와 업로드를 위한 pre-signed url을 발급받습니다.
     *
     * 실제 리소스 업로드는 pre-signed url로 업로드를 진행해야 하며 게시글 연결을 진행하지 않으면 추후 삭제될 수 있습니다.
     *
     * @summary 첨부 파일 정보 생성
     * @tag mine
     * @param body
     * @return 미리 서명된 정보
     */
    @core.TypedRoute.Post()
    async sign(
        @core.TypedBody() body: IAttachment.ICreateBody,
        @nest.Request() req: Request,
    ): Promise<IAttachment.IPresigned> {
        body;
        req;
        throw Error();
    }
}
