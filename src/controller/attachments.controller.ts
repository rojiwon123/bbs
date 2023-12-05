import core from "@nestia/core";
import * as nest from "@nestjs/common";
import { Request } from "express";

import { AttachmentsUsecase } from "@APP/application/attachments.usecase";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAttachment } from "@APP/types/IAttachment";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

@nest.Controller("attachments")
export class AttachmentsController {
    /**
     * 게시글 파일 첨부를 위해 첨부 파일 식별자와 업로드를 위한 pre-signed url을 발급받습니다.
     *
     * 실제 리소스 업로드는 pre-signed url로 업로드를 진행해야 하며 게시글 연결을 진행하지 않으면 추후 삭제될 수 있습니다.
     *
     * @summary 첨부 파일 정보 생성
     * @tag attachment
     * @security bearer
     * @param body 첨부 파일 생성 정보
     * @return 미리 서명된 정보
     */
    @core.TypedException<
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
        | ErrorCode.Permission.Required
    >(nest.HttpStatus.UNAUTHORIZED)
    @core.TypedRoute.Post()
    async sign(
        @core.TypedBody() body: IAttachment.ICreateBody,
        @nest.Request() req: Request,
    ): Promise<IAttachment.IPresigned> {
        const result = await AttachmentsUsecase.create(req)(body);
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
            }
        throw Failure.Http.fromExternal(error);
    }
}
