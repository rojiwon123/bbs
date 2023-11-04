import { map, pipe, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { IArticle } from "@APP/types/IArticle";
import { DateMapper } from "@APP/utils/date";
import { Entity } from "@APP/utils/fx";
import { Random } from "@APP/utils/random";
import { Result } from "@APP/utils/result";

import { Prisma } from "../../db/edge";

export namespace Article {
    export const getList =
        (tx: Prisma.TransactionClient = prisma) =>
        (input: {
            where?: Prisma.articlesWhereInput;
            skip: number;
            take: number;
            orderBy: Prisma.articlesOrderByWithRelationInput;
        }) =>
            pipe(
                input,
                async ({ where = {}, skip, take, orderBy }) =>
                    tx.articles.findMany({
                        where: { ...where, deleted_at: null },
                        skip,
                        take,
                        orderBy,
                        select: {
                            id: true,
                            created_at: true,
                            deleted_at: true,
                            snapshots: {
                                take: 1,
                                orderBy: { created_at: "desc" },
                                select: {
                                    title: true,
                                    created_at: true,
                                },
                            },
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    image_url: true,
                                    deleted_at: true,
                                    membership: {
                                        select: {
                                            id: true,
                                            name: true,
                                            image_url: true,
                                            rank: true,
                                            deleted_at: true,
                                        },
                                    },
                                },
                            },
                            board: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    }),
                map((article): IArticle.ISummary => {
                    const author: IArticle.IAuthor = Entity.exist(
                        article.author,
                    )
                        ? {
                              status: "active",
                              id: article.author.id,
                              name: article.author.name,
                              image_url: article.author.image_url,
                              membership: Entity.exist(
                                  article.author.membership,
                              )
                                  ? {
                                        id: article.author.membership.id,
                                        name: article.author.membership.name,
                                        image_url:
                                            article.author.membership.image_url,
                                        rank: article.author.membership.rank,
                                    }
                                  : null,
                          }
                        : { status: "deleted" };
                    const snapshot = article.snapshots.at(-1) ?? {
                        title: "",
                        created_at: article.created_at,
                    };
                    return {
                        id: article.id,
                        title: snapshot.title,
                        author,
                        created_at: DateMapper.toISO(article.created_at),
                        updated_at:
                            article.created_at < snapshot.created_at
                                ? DateMapper.toISO(snapshot.created_at)
                                : null,
                    };
                }),
                toArray,
            );

    export const create =
        (tx: Prisma.TransactionClient = prisma) =>
        async (input: IArticle.ICreate) => {
            const created_at = DateMapper.toISO();
            const article_id = Random.uuid();
            await tx.articles.create({
                data: {
                    id: article_id,
                    board_id: input.board_id,
                    author_id: input.author_id,
                    is_notice: false,
                    created_at,
                    deleted_at: null,
                    snapshots: {
                        create: {
                            id: Random.uuid(),
                            title: input.title,
                            body_format: input.body.format,
                            body_url: input.body.url,
                            created_at,
                        },
                    },
                },
            });
            return Result.Ok.map<IArticle.Identity>({ article_id });
        };
}
