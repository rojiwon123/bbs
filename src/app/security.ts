import { isNull } from "@fxts/core";
import {
    ExecutionContext,
    HttpStatus,
    createParamDecorator,
} from "@nestjs/common";
import { Request } from "express";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IUser } from "@APP/types/IUser";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";
import { Token } from "./token";
import { User } from "./user";

export type Security<T = string> = { token: T | null };
export namespace Security {
    const security =
        <T>({
            from,
            key,
            extract,
        }: {
            from: "headers" | "cookies";
            key: string;
            extract: (input: unknown) => T | null;
        }) =>
        (ctx: ExecutionContext): Security<T> => ({
            token: extract(ctx.switchToHttp().getRequest<Request>()[from][key]),
        });

    export const HttpBearer = () =>
        createParamDecorator<string, ExecutionContext, Security>(
            (token_type, ctx) =>
                security({
                    from: "headers",
                    key: "authorization",
                    extract: (input: unknown): string | null =>
                        typeof input === "string"
                            ? input
                                  .match(
                                      new RegExp(`^${token_type}\\s+\\S+`, "i"),
                                  )
                                  ?.at(0)
                                  ?.split(/\s+/)[1] ?? null
                            : null,
                })(ctx),
        )("Bearer");

    export const required = (security: Security): string => {
        const token = security.token;
        if (isNull(token))
            throw new Failure.Http(
                "REQUIRED_PERMISSION" satisfies ErrorCode.Permission.Required,
                HttpStatus.UNAUTHORIZED,
            );
        return token;
    };

    export const verify =
        (tx: Prisma.TransactionClient = prisma) =>
        async (token: string): Promise<IUser> => {
            const payload = Token.verify(token);
            if (Result.Error.is(payload)) {
                const error = Result.Error.flatten(payload);
                if (error instanceof Failure.Internal)
                    switch (error.message) {
                        case "EXPIRED":
                            throw new Failure.Http(
                                "EXPIRED_PERMISSION" satisfies ErrorCode.Permission.Expired,
                                HttpStatus.UNAUTHORIZED,
                            );
                        case "INVALID":
                            throw new Failure.Http(
                                "INVALID_PERMISSION" satisfies ErrorCode.Permission.Invalid,
                                HttpStatus.UNAUTHORIZED,
                            );
                    }
                throw Failure.Http.fromExternal(error);
            }
            const { user_id } = Result.Ok.flatten(payload);
            const user = await User.get(tx)({ user_id });
            if (Result.Error.is(user))
                throw new Failure.Http(
                    "INVALID_PERMISSION" satisfies ErrorCode.Permission.Invalid,
                    HttpStatus.UNAUTHORIZED,
                );

            return Result.Ok.flatten(user);
        };
}
