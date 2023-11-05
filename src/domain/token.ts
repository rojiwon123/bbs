import { isNull, pipe, unless } from "@fxts/core";
import typia from "typia";

import { Configuration } from "@APP/infrastructure/config";
import { IToken } from "@APP/types/IToken";
import { Crypto } from "@APP/utils/crypto";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

export namespace Token {
    const hour = 1000 * 60 * 60 * 1;
    const day = hour * 24;

    const duration = day * 7;

    export const generate = (
        input: IToken.ICreate,
    ): Result<IToken.IOutput, Failure.External<"Crypto.encrypt">> => {
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
                Crypto.encrypt({
                    plain,
                    key: Configuration.ACCESS_TOKEN_KEY,
                }),

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

    export const verify = (
        token: string,
    ): Result<
        IToken.IPayload,
        | Failure.External<"Crypto.decrypt">
        | Failure.Internal<"INVALID" | "EXPIRED">
    > => {
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
            return Result.Error.map(new Failure.Internal("EXPIRED"));

        return Result.Ok.map(payload);
    };
}
