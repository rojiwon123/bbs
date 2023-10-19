import { isNull, pipe, unless } from "@fxts/core";
import typia from "typia";

import { Configuration } from "@APP/infrastructure/config";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IToken } from "@APP/types/IToken";
import { Crypto } from "@APP/utils/crypto";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { assertModule } from "@APP/utils/fx";
import { Result } from "@APP/utils/result";

export interface Token {
    readonly generate: (
        input: IToken.IInput,
    ) => Result<IToken.IOutput, Failure.External<"Crypto.encrypt">>;
    readonly verify: (
        token: string,
    ) => Result<
        IToken.IPayload,
        Failure.Internal<ErrorCode.Token> | Failure.External<"Crypto.decrypt">
    >;
}

/**
 * 인증 토큰 발급 모듈
 */
export namespace Token {
    const hour = 1000 * 60 * 60 * 1;
    const day = hour * 24;

    const duration = day * 7;

    export const generate: Token["generate"] = (input) => {
        const expired_at = DateMapper.toISO(new Date(Date.now() + duration));
        return pipe(
            input,
            ({ auth_id }) =>
                typia.json.stringify<IToken.IPayload>({
                    type: "access",
                    auth_id,
                    expired_at,
                }),
            (plain) =>
                Crypto.encrypt({ plain, key: Configuration.ACCESS_TOKEN_KEY }),

            unless(
                Result.Error.is,
                Result.Ok.lift(
                    (token): IToken.IOutput => ({
                        token,
                        expired_at,
                    }),
                ),
            ),
        );
    };

    export const verify: Token["verify"] = (token) =>
        pipe(
            Crypto.decrypt({ token, key: Configuration.ACCESS_TOKEN_KEY }),

            unless(Result.Error.is, (ok) =>
                pipe(
                    Result.Ok.flatten(ok),

                    typia.json.createIsParse<IToken.IPayload>(),

                    (payload) =>
                        isNull(payload)
                            ? Result.Error.map(
                                  new Failure.Internal<ErrorCode.Token.Invalid>(
                                      "INVALID_TOKEN",
                                  ),
                              )
                            : new Date() > new Date(payload.expired_at)
                            ? Result.Error.map(
                                  new Failure.Internal<ErrorCode.Token.Expired>(
                                      "EXPIRED_TOKEN",
                                  ),
                              )
                            : Result.Ok.map(payload),
                ),
            ),
        );
}

assertModule<Token>(Token);
