import { isNull, pipe } from "@fxts/core";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { DateMapper } from "@APP/utils/date";
import { Failure } from "@APP/utils/failure";
import { compare } from "@APP/utils/fx";
import { Result } from "@APP/utils/result";

import { Prisma, users } from "../../db/edge";

export namespace Article {
    export const getList = ({
        skip = 0,
        limit = 10,
        posted_at = "desc",
    }: IArticle.ISearch): Promise<Result.Ok<IArticle.IPaginatedResponse>> =>
        pipe(
            ArticleEntity.Summary.select(),
            async (select) =>
                prisma.articles.findMany({
                    select,
                    where: { deleted_at: null },
                    skip,
                    take: limit,
                    orderBy: { created_at: posted_at },
                }),
            ArticleEntity.Summary.map,
            (data): IArticle.IPaginatedResponse => ({ skip, limit, data }),
            Result.Ok.map,
        );

    export const get =
        (tx: Prisma.TransactionClient = prisma) =>
        ({
            article_id,
        }: {
            article_id: string & typia.tags.Format<"uuid">;
        }): Promise<
            Result<IArticle, Failure.Internal<ErrorCode.Article.NotFound>>
        > =>
            pipe(
                article_id,

                async (id) =>
                    tx.articles.findFirst({
                        where: { id, deleted_at: null },
                        select: ArticleEntity.select(),
                    }),

                (article) =>
                    isNull(article)
                        ? Result.Error.map(
                              new Failure.Internal<ErrorCode.Article.NotFound>(
                                  "NOT_FOUND_ARTICLE",
                              ),
                          )
                        : Result.Ok.map(ArticleEntity.map(article)),
            );

    export const create =
        (tx: Prisma.TransactionClient = prisma) =>
        (author_id: string & typia.tags.Format<"uuid">) =>
        (input: IArticle.ICreate): Promise<Result.Ok<IArticle>> => {
            tx;
            author_id;
            input;
            throw Error();
        };
}

export namespace ArticleEntity {
    export const mapAuthor = (
        author: Pick<users, "id" | "name" | "image_url" | "deleted_at">,
    ): IArticle.IAuthor => {
        return isNull(author.deleted_at)
            ? {
                  id: author.id,
                  name: author.name,
                  image_url: author.image_url,
              }
            : {
                  id: author.id,
                  name: "deleted user",
                  image_url: null,
              };
    };

    export namespace Summary {
        export const select = () =>
            ({
                id: true,
                created_at: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        image_url: true,
                        deleted_at: true,
                    },
                },
                snapshots: {
                    select: {
                        title: true,
                        created_at: true,
                    },
                },
            }) satisfies Prisma.articlesSelect;

        export const map = (
            list: Awaited<
                ReturnType<
                    typeof prisma.articles.findMany<{
                        select: ReturnType<typeof select>;
                    }>
                >
            >,
        ): IArticle.ISummary[] =>
            list.map((value) => {
                const isEdited = value.snapshots.length > 1;
                const snapshots = value.snapshots.sort(
                    compare("desc")((a) => a.created_at.getTime()),
                );

                const last_snapshot = {
                    title: snapshots.at(0)?.title ?? "",
                    created_at: DateMapper.toISO(
                        snapshots.at(0)?.created_at ?? value.created_at,
                    ),
                };

                return {
                    id: value.id,
                    author: mapAuthor(value.author),
                    title: last_snapshot.title,
                    posted_at: DateMapper.toISO(value.created_at),
                    updated_at: isEdited ? last_snapshot.created_at : null,
                };
            });
    }

    export const select = () =>
        ({
            id: true,
            created_at: true,
            deleted_at: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    image_url: true,
                    deleted_at: true,
                },
            },
            snapshots: {
                select: {
                    title: true,
                    body_format: true,
                    body_url: true,
                    created_at: true,
                },
            },
        }) satisfies Prisma.articlesSelect;

    export const map = (
        input: NonNullable<
            Awaited<
                ReturnType<
                    typeof prisma.articles.findFirst<{
                        select: ReturnType<typeof select>;
                    }>
                >
            >
        >,
    ): IArticle => ({
        id: input.id,
        author: mapAuthor(input.author),
        snapshots: input.snapshots
            .sort(compare("desc")((a) => a.created_at.getTime()))
            .map((snapshot) => ({
                ...snapshot,
                created_at: DateMapper.toISO(snapshot.created_at),
            })),
        posted_at: DateMapper.toISO(input.created_at),
    });
}
