import {
    ExecutionContext,
    HttpException,
    HttpStatus,
    createParamDecorator,
} from "@nestjs/common";
import { Request } from "express";

const security =
    <T, R>(options: {
        from: "headers" | "cookies";
        key: string;
        is: (input: unknown) => input is T;
        extract: (input: T) => R;
    }) =>
    (ctx: ExecutionContext): R => {
        const { from, key, is, extract } = options;
        const value: unknown = ctx.switchToHttp().getRequest<Request>()[from][
            key
        ];
        if (!is(value))
            throw new HttpException(
                "UNAUTHORIZED_REQUEST",
                HttpStatus.UNAUTHORIZED,
            );
        return extract(value);
    };

export const Authorization = () =>
    createParamDecorator<string, ExecutionContext, string>((token_type, ctx) =>
        security({
            from: "headers",
            key: "authorization",
            is: (input: unknown): input is string => {
                if (typeof input !== "string") return false;
                return (
                    input.match(new RegExp(`^${token_type}\\s+\\S+`, "i")) !==
                    null
                );
            },
            extract: (line) => line.split(/\s+/)[1]!,
        })(ctx),
    )("bearer");
