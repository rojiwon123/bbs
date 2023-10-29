import { isNull } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { IMembership } from "@APP/types/IMembership";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";

export interface Membership {
    readonly getList: (
        tx?: Prisma.TransactionClient,
    ) => () => Promise<Result.Ok<IMembership[]>>;
}
export namespace Membership {
    export const getList: Membership["getList"] =
        (tx = prisma) =>
        async () => {
            const memberships = await tx.memberships.findMany({
                select: {
                    id: true,
                    name: true,
                    rank: true,
                    image_url: true,
                    deleted_at: true,
                },
            });
            return Result.Ok.map(
                memberships.filter((membership) =>
                    isNull(membership.deleted_at),
                ),
            );
        };
}
