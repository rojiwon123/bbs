import { isNull, negate } from "@fxts/core";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IUser } from "@APP/types/IUser";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { assertModule } from "@APP/utils/fx";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";

export interface User {
    readonly access: (
        tx?: Prisma.TransactionClient,
    ) => (
        user_id: string & typia.tags.Format<"uuid">,
    ) => Promise<Result<true, Failure.Internal<ErrorCode.User.NotFound>>>;

    readonly get: (
        tx?: Prisma.TransactionClient,
    ) => (
        user_id: string & typia.tags.Format<"uuid">,
    ) => Promise<Result<IUser, Failure.Internal<ErrorCode.User.NotFound>>>;
}
export namespace User {
    export const access: User["access"] =
        (tx = prisma) =>
        async (user_id) => {
            const user = await tx.users.findFirst({ where: { id: user_id } });
            if (isNull(user))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.User.NotFound>(
                        "NOT_FOUND_USER",
                    ),
                );
            if (negate(isNull)(user.deleted_at))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.User.NotFound>(
                        "NOT_FOUND_USER",
                    ),
                );
            return Result.Ok.map(true);
        };

    export const get: User["get"] =
        (tx = prisma) =>
        async (user_id) => {
            const user = await tx.users.findFirst({ where: { id: user_id } });
            if (isNull(user) || negate(isNull)(user.deleted_at))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.User.NotFound>(
                        "NOT_FOUND_USER",
                    ),
                );
            return Result.Ok.map({
                id: user.id,
                name: user.name,
                image_url: user.image_url,
                introduction: user.introduction,
                created_at: DateMapper.toISO(user.created_at),
                updated_at: isNull(user.updated_at)
                    ? null
                    : DateMapper.toISO(user.updated_at),
            });
        };
}

assertModule<User>(User);
