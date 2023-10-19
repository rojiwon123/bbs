import { isNull, pipe, sort } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { IArticle } from "@APP/types/IArticle";
import { DateMapper } from "@APP/utils/date";
import { Result } from "@APP/utils/result";

import { Prisma, users } from "../../db/edge";

export namespace Article {
    export const getList = async ({
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
}

export namespace ArticleEntity {
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
                const snapshots = sort((a, b) => {
                    b.created_at.getTime() - a.created_at.getTime();
                }, value.snapshots);
                const posted_at = DateMapper.toISO(
                    snapshots.at(-1)?.created_at ?? value.created_at,
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
                    posted_at,
                    updated_at: isEdited ? last_snapshot.created_at : null,
                };
            });
    }
}
