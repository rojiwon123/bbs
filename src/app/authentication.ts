import { isNull } from "@fxts/core";
import typia from "typia";

import { Oauth } from "@APP/externals/oauth";
import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { assertModule } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";
import { Token } from "./token";
import { User } from "./user";

export interface Authentication {
    readonly getUrls: () => Promise<Result.Ok<IAuthentication.IOauthUrls>>;
    readonly authorize: (
        tx?: Prisma.TransactionClient,
    ) => (
        input: IAuthentication.IOauthInput,
    ) => Promise<
        Result<
            IAuthentication,
            | Failure.Internal<ErrorCode.Authentication>
            | Failure.External<"Crypto.encrypt">
        >
    >;
}
export namespace Authentication {
    const getOauthUser = (input: IAuthentication.IOauthInput) => {
        switch (input.oauth_type) {
            case "github":
                return Oauth.Github.getProfile(input.code);
            case "kakao":
                return Oauth.Kakao.getProfile(input.code);
        }
    };
    const getAuthentication = (
        user_id: string & typia.tags.Format<"uuid">,
    ): Result<IAuthentication, Failure.External<"Crypto.encrypt">> => {
        const result = Token.generate({ user_id });
        if (Result.Error.is(result)) return result;
        return Result.Ok.map({
            status: "active",
            access_token: Result.Ok.flatten(result),
        });
    };

    export const getUrls: Authentication["getUrls"] = async () => {
        return Result.Ok.map({
            github: Oauth.Github.getUrlForLogin(),
            kakao: Oauth.Kakao.getUrlForLogin(),
        });
    };
    export const authorize: Authentication["authorize"] =
        (tx = prisma) =>
        async (input) => {
            const oauth = await getOauthUser(input);
            if (Result.Error.is(oauth))
                return Result.Error.map(
                    new Failure.Internal<ErrorCode.Authentication>(
                        "AUTHENTICATION_FAIL",
                    ),
                );
            const { oauth_sub, profile } = Result.Ok.flatten(oauth);
            const auth =
                (await tx.authentications.findFirst({
                    where: {
                        oauth_sub,
                        oauth_type: input.oauth_type,
                        deleted_at: null,
                    },
                    select: {
                        id: true,
                        user: {
                            where: { deleted_at: null },
                            select: { id: true },
                        },
                    },
                })) ??
                (await tx.authentications.create({
                    data: {
                        id: Random.uuid(),
                        oauth_sub,
                        oauth_type: input.oauth_type,
                        created_at: DateMapper.toISO(),
                    },
                    select: {
                        id: true,
                        user: {
                            where: { deleted_at: null },
                            select: { id: true },
                        },
                    },
                }));

            if (isNull(auth.user)) {
                const { user_id } = Result.Ok.flatten(
                    await User.create(tx)({
                        name: profile.name,
                        image_url: profile.image_url,
                        membership_id: null,
                    }),
                );
                await tx.authentications.updateMany({
                    where: { id: auth.id },
                    data: { user_id },
                });
                return getAuthentication(user_id);
            }
            return getAuthentication(auth.user.id);
        };
}

assertModule<Authentication>(Authentication);
