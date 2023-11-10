import { isNull } from "@fxts/core";
import { Request } from "express";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IUser } from "@APP/types/IUser";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";
import { Token } from "./token";
import { User } from "./user";

export namespace Authentication {
    const get =
        <T>({
            from,
            key,
            extract,
        }: {
            from: "headers" | "cookies";
            key: string;
            extract: (input: unknown) => T | null;
        }) =>
        (req: Request): T | null =>
            extract(req[from][key]);

    const verify =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            token: string,
        ): Promise<
            Result<
                IUser,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                  >
            >
        > => {
            const payload = Token.verify(token);
            if (Result.Error.is(payload)) {
                const error = Result.Error.flatten(payload);
                if (error instanceof Failure.Internal)
                    switch (error.message) {
                        case "EXPIRED":
                            return Result.Error.map(
                                new Failure.Internal<ErrorCode.Permission.Expired>(
                                    "EXPIRED_PERMISSION",
                                ),
                            );
                        case "INVALID":
                            return Result.Error.map(
                                new Failure.Internal<ErrorCode.Permission.Invalid>(
                                    "INVALID_PERMISSION",
                                ),
                            );
                    }
                return Result.Error.map(error);
            }
            const { user_id } = Result.Ok.flatten(payload);
            const user = await User.get(tx)({ id: user_id });
            if (Result.Error.is(user))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Invalid>(
                        "INVALID_PERMISSION",
                    ),
                );
            return user;
        };

    const getHttpBearer = get({
        from: "headers",
        key: "authorization",
        extract: (input: unknown): string | null =>
            typeof input === "string"
                ? input
                      .match(new RegExp("^Bearer\\s+\\S+", "i"))
                      ?.at(0)
                      ?.split(/\s+/)[1] ?? null
                : null,
    });

    export const verifyRequiredUserByHttpBearer =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            req: Request,
        ): Promise<
            Result<
                IUser,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Required
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                  >
            >
        > => {
            const token = getHttpBearer(req);
            if (isNull(token))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Permission.Required>(
                        "REQUIRED_PERMISSION",
                    ),
                );
            return verify(tx)(token);
        };

    export const verifyOptionalUserByHttpBearer =
        (tx: Prisma.TransactionClient = prisma) =>
        async (
            req: Request,
        ): Promise<
            Result<
                IUser | null,
                | Failure.External<"Crypto.decrypt">
                | Failure.Internal<
                      | ErrorCode.Permission.Expired
                      | ErrorCode.Permission.Invalid
                      | ErrorCode.Permission.Insufficient
                  >
            >
        > => {
            const token = getHttpBearer(req);
            return isNull(token) ? Result.Ok.map(null) : verify(tx)(token);
        };
}
