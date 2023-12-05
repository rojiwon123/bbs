import { Request } from "express";
import typia from "typia";

import { Attachment } from "@APP/domain/attachment";
import { Authentication } from "@APP/domain/authentication";
import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAttachment } from "@APP/types/IAttachment";
import { Regex } from "@APP/types/global";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

export namespace AttachmentsUsecase {
    export const create =
        (req: Request) =>
        async (
            input: IAttachment.ICreateBody,
        ): Promise<
            Result<
                IAttachment.IPresigned,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Required
                  >
            >
        > => {
            const tx = prisma;
            const security =
                await Authentication.verifyRequiredUserByHttpBearer(tx)(req);
            if (Result.Error.is(security)) return security;
            const user = Result.Ok.flatten(security);

            const result = await Attachment.create(tx)({
                ...input,
                owner_id: user.id,
                url: typia.random<Regex.URL>(),
            });

            return Result.Ok.lift<IAttachment.Identity, IAttachment.IPresigned>(
                (identity) => ({
                    attachment_id: identity.attachment_id,
                    presigned_url: typia.random<Regex.URL>(),
                }),
            )(result);
        };
}
