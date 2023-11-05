import { filter, isNull, map, negate, pipe, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IMembership } from "@APP/types/IMembership";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";

export namespace Membership {
    export const compare = (
        actor: IMembership | null,
        target: IMembership | null,
    ): Result<null, Failure.Internal<ErrorCode.Permission.Insufficient>> => {
        if (isNull(target)) return Result.Ok.map(null);
        if (negate(isNull)(actor) && actor.rank >= target.rank)
            return Result.Ok.map(null);

        return Result.Error.map(
            new Failure.Internal("INSUFFICIENT_PERMISSION"),
        );
    };

    export const getList =
        (tx: Prisma.TransactionClient = prisma) =>
        (input: Prisma.membershipsWhereInput = {}) =>
            pipe(
                input,
                async (where) =>
                    tx.memberships.findMany({
                        where,
                        select: {
                            id: true,
                            name: true,
                            rank: true,
                            image_url: true,
                            deleted_at: true,
                        },
                    }),
                filter(Entity.exist),
                map(
                    ({ id, name, image_url, rank }): IMembership => ({
                        id,
                        name,
                        image_url,
                        rank,
                    }),
                ),
                toArray,
                Result.Ok.map,
            );
}
