import { isNull } from "@fxts/core";
import {
    ExecutionContext,
    HttpException,
    HttpStatus,
    createParamDecorator,
} from "@nestjs/common";
import { Request } from "express";
import typia from "typia";

import { ErrorCode } from "@APP/types/ErrorCode";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

import { Token } from "./token";

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
            throw new HttpException(
                "REQUIRED_PERMISSION" satisfies ErrorCode.Permission.Required,
                HttpStatus.UNAUTHORIZED,
            );
        return token;
    };

    export const verify = (
        token: string,
    ): string & typia.tags.Format<"uuid"> => {
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
        return Result.Ok.flatten(payload).user_id;
    };
}
