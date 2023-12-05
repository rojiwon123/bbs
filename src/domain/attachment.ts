import { Prisma } from "@PRISMA";

import { prisma } from "@APP/infrastructure/DB";
import { IAttachment } from "@APP/types/IAttachment";
import { DateMapper } from "@APP/utils/date";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

export namespace Attachment {
    export const create =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: IAttachment.ICreate,
        ): Promise<Result.Ok<IAttachment.Identity>> => {
            const attachment_id = Random.uuid();
            await tx.attachments.create({
                data: {
                    id: attachment_id,
                    name: input.name,
                    extension: input.extension,
                    created_at: DateMapper.toISO(),
                    owner_id: input.owner_id,
                    url: input.url,
                },
            });
            return Result.Ok.map({ attachment_id });
        };
}
