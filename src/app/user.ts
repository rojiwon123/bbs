import { isNull, negate } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IUser } from "@APP/types/IUser";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { assertModule } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";

export interface User {
    readonly get: (
        tx?: Prisma.TransactionClient,
    ) => (
        input: IUser.Identity,
    ) => Promise<Result<IUser, Failure.Internal<ErrorCode.User.NotFound>>>;

    readonly create: (
        tx?: Prisma.TransactionClient,
    ) => (input: IUser.ICreate) => Promise<Result.Ok<IUser.Identity>>;

    readonly update: (
        tx?: Prisma.TransactionClient,
    ) => (
        input: IUser.IUpdate,
    ) => Promise<
        Result<IUser.Identity, Failure.Internal<ErrorCode.User.NotFound>>
    >;

    readonly remove: (
        tx?: Prisma.TransactionClient,
    ) => (
        input: IUser.Identity,
    ) => Promise<
        Result<IUser.Identity, Failure.Internal<ErrorCode.User.NotFound>>
    >;
}
export namespace User {
    export const get: User["get"] =
        (tx = prisma) =>
        async ({ user_id }) => {
            const user = await tx.users.findFirst({
                where: { id: user_id },
                select: {
                    id: true,
                    name: true,
                    image_url: true,
                    created_at: true,
                    updated_at: true,
                    deleted_at: true,
                    membership: {
                        select: {
                            id: true,
                            name: true,
                            image_url: true,
                            rank: true,
                        },
                    },
                },
            });
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
                membership: user.membership,
                created_at: DateMapper.toISO(user.created_at),
                updated_at: isNull(user.updated_at)
                    ? null
                    : DateMapper.toISO(user.updated_at),
            });
        };

    export const create: User["create"] =
        (tx = prisma) =>
        async (input) => {
            const user = await tx.users.create({
                data: {
                    id: Random.uuid(),
                    name: input.name,
                    image_url: input.image_url,
                    membership_id: input.membership_id,
                    created_at: DateMapper.toISO(),
                },
            });
            return Result.Ok.map({ user_id: user.id });
        };

    export const update: User["update"] =
        (tx = prisma) =>
        async (input) => {
            const { count } = await tx.users.updateMany({
                where: { id: input.id, deleted_at: null },
                data: {
                    name: input.name,
                    image_url: input.image_url,
                    membership_id: input.membership_id,
                    updated_at: DateMapper.toISO(),
                },
            });
            if (count === 0)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.User.NotFound>(
                        "NOT_FOUND_USER",
                    ),
                );
            return Result.Ok.map({ user_id: input.id });
        };

    export const remove: User["remove"] =
        (tx = prisma) =>
        async ({ user_id }) => {
            const { count } = await tx.users.updateMany({
                where: { id: user_id, deleted_at: null },
                data: {
                    deleted_at: DateMapper.toISO(),
                },
            });
            if (count === 0)
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.User.NotFound>(
                        "NOT_FOUND_USER",
                    ),
                );
            return Result.Ok.map({ user_id });
        };
}

assertModule<User>(User);

export namespace UserEntity {}
