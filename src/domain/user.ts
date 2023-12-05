import { Prisma } from "@PRISMA";
import { isNull, pipe } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IUser } from "@APP/types/IUser";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

export namespace User {
    export const get =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            input: Prisma.usersWhereInput,
        ): Promise<Result<IUser, Failure.Internal<ErrorCode.User.NotFound>>> =>
            pipe(
                input,
                async (where) =>
                    tx.users.findFirst({
                        where,
                        select: {
                            id: true,
                            name: true,
                            image_url: true,
                            created_at: true,
                            updated_at: true,
                            deleted_at: true,
                            membership: {
                                where: { deleted_at: null },
                                select: {
                                    id: true,
                                    name: true,
                                    image_url: true,
                                    rank: true,
                                },
                            },
                        },
                    }),
                (user) =>
                    Entity.exist(user)
                        ? Result.Ok.map({
                              id: user.id,
                              name: user.name,
                              image_url: user.image_url,
                              membership: user.membership,
                              created_at: DateMapper.toISO(user.created_at),
                              updated_at: isNull(user.updated_at)
                                  ? null
                                  : DateMapper.toISO(user.updated_at),
                          })
                        : Result.Error.map(
                              new Failure.Internal<ErrorCode.User.NotFound>(
                                  "NOT_FOUND_USER",
                              ),
                          ),
            );

    export const create =
        (tx: Prisma.TransactionClient = prisma) =>
        async (input: IUser.ICreate): Promise<Result.Ok<IUser.Identity>> => {
            const user = await tx.users.create({
                data: {
                    id: Random.uuid(),
                    name: input.name,
                    image_url: input.image_url,
                    membership_id: input.membership_id,
                    created_at: DateMapper.toISO(),
                    deleted_at: null,
                },
            });
            return Result.Ok.map<IUser.Identity>({ user_id: user.id });
        };

    export const update =
        (tx = prisma) =>
        async (
            input: IUser.IUpdate,
        ): Promise<
            Result<IUser.Identity, Failure.Internal<ErrorCode.User.NotFound>>
        > => {
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
            return Result.Ok.map<IUser.Identity>({ user_id: input.id });
        };

    export const remove =
        (tx: Prisma.TransactionClient = prisma) =>
        async ({ user_id }: IUser.Identity) => {
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
            return Result.Ok.map<IUser.Identity>({ user_id });
        };
}
