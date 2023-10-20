import { isNull, pipe, unless } from "@fxts/core";
import typia from "typia";

import { Configuration } from "@APP/infrastructure/config";
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
        | Failure.Internal<"EXPIRED" | "INVALID">
        | Failure.External<"Crypto.decrypt">
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
            ({ user_id }) =>
                typia.json.stringify<IToken.IPayload>({
                    type: "access",
                    user_id,
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

    export const verify: Token["verify"] = (token) => {
        const now = new Date();
        const decrypted = Crypto.decrypt({
            token,
            key: Configuration.ACCESS_TOKEN_KEY,
        });
        if (Result.Error.is(decrypted)) return decrypted;
        const plain = Result.Ok.flatten(decrypted);
        const payload = typia.json.isParse<IToken.IPayload>(plain);

        // If Invalid
        if (isNull(payload))
            return Result.Error.map(new Failure.Internal("INVALID"));

        // If Expired
        if (now > new Date(payload.expired_at))
            Result.Error.map(new Failure.Internal("EXPIRED"));

        return Result.Ok.map(payload);
    };
}

assertModule<Token>(Token);
