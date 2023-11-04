import { isNull, negate } from "@fxts/core";
import typia from "typia";

import { Token } from "@APP/domain/token";
import { User } from "@APP/domain/user";
import { Oauth } from "@APP/externals/oauth";
import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IAuthentication } from "@APP/types/IAuthentication";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { Entity } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

const isNonNull: <T>(input: NonNullable<T> | null) => input is NonNullable<T> =
    negate(isNull);
export namespace OauthUsecase {
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

    export const getUrls = async (): Promise<
        Result.Ok<IAuthentication.IOauthUrls>
    > =>
        Result.Ok.map({
            github: Oauth.Github.getUrlForLogin(),
            kakao: Oauth.Kakao.getUrlForLogin(),
        });

    export const signInByOauth = async (
        input: IAuthentication.IOauthInput,
    ): Promise<
        Result<
            IAuthentication,
            | Failure.External<"Crypto.encrypt">
            | Failure.Internal<
                  ErrorCode.Authentication | ErrorCode.User.NotFound
              >
        >
    > => {
        const oauth = await getOauthUser(input);
        if (Result.Error.is(oauth))
            return Result.Error.map(
                new Failure.Internal<ErrorCode.Authentication>(
                    "AUTHENTICATION_FAIL",
                ),
            );
        const { oauth_sub } = Result.Ok.flatten(oauth);

        const auth = await prisma.authentications.findFirst({
            where: {
                oauth_sub,
                oauth_type: input.oauth_type,
            },
            select: {
                id: true,
                deleted_at: true,
                user: { select: { id: true, deleted_at: true } },
            },
        });
        if (Entity.exist(auth) && Entity.exist(auth.user))
            return getAuthentication(auth.user.id);

        return Result.Error.map(
            new Failure.Internal<ErrorCode.User.NotFound>("NOT_FOUND_USER"),
        );
    };

    export const signUpByOauth = async (
        input: IAuthentication.IOauthInput,
    ): Promise<
        Result<
            IAuthentication,
            | Failure.External<"Crypto.encrypt">
            | Failure.Internal<ErrorCode.Authentication>
        >
    > => {
        const oauth = await getOauthUser(input);
        if (Result.Error.is(oauth))
            return Result.Error.map(
                new Failure.Internal<ErrorCode.Authentication>(
                    "AUTHENTICATION_FAIL",
                ),
            );
        const { oauth_sub, profile } = Result.Ok.flatten(oauth);
        const tx = prisma;
        const auth = await tx.authentications.findFirst({
            where: {
                oauth_sub,
                oauth_type: input.oauth_type,
            },
            select: {
                id: true,
                deleted_at: true,
                user: { select: { id: true, deleted_at: true } },
            },
        });
        // 인증 정보가 존재하고
        if (isNonNull(auth)) {
            // 활성화된 사용자 정보가 존재하고
            if (Entity.exist(auth.user)) {
                // 인증 정보는 비활성화되어 있을 때
                if (Entity.isDeleted(auth))
                    await tx.authentications.updateMany({
                        where: { id: auth.id },
                        data: { deleted_at: null },
                    });
                return getAuthentication(auth.user.id);
            }
            // 사용자 정보가 없거나 비활성화 되어있을 때
            const { user_id } = Result.Ok.flatten(
                await User.create(tx)({
                    name: profile.name,
                    image_url: profile.image_url,
                    membership_id: null,
                }),
            );
            await tx.authentications.updateMany({
                where: { id: auth.id },
                data: { user_id, deleted_at: null },
            });
            return getAuthentication(user_id);
        }

        // 인증 정보가 존재하지 않을 때
        const { user_id } = Result.Ok.flatten(
            await User.create(tx)({
                name: profile.name,
                image_url: profile.image_url,
                membership_id: null,
            }),
        );
        await tx.authentications.create({
            data: {
                id: Random.uuid(),
                user_id,
                oauth_sub,
                oauth_type: input.oauth_type,
                created_at: DateMapper.toISO(),
            },
        });
        return getAuthentication(user_id);
    };
}
