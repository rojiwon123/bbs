import { isNull, isUndefined } from "@fxts/core";
import { RandomGenerator } from "@nestia/e2e";
import assert from "assert";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { DateMapper } from "@APP/utils/date";
import { Random } from "@APP/utils/random";

import { ArticleBodyFormat, Prisma } from "../../../db/edge";

export namespace Seed {
    type UUID = string & typia.tags.Format<"uuid">;

    const createUrl = typia.createRandom<string & typia.tags.Format<"url">>();
    const createNullableUrl = typia.createRandom<
        (string & typia.tags.Format<"url">) | null
    >();

    export const getMembershipId = async (name: string): Promise<UUID> => {
        const membership = await prisma.memberships.findFirst({
            where: { name, deleted_at: null },
        });
        if (isNull(membership)) throw Error("not found membership");
        return membership.id;
    };
    export const getNullableMembershipId = async (
        name: string | null,
    ): Promise<UUID | null> => (isNull(name) ? null : getMembershipId(name));

    export const getUserId = async (name: string): Promise<UUID> => {
        const user = await prisma.users.findFirst({
            where: { name, deleted_at: null },
        });
        if (isNull(user)) throw Error("not found user");
        return user.id;
    };

    export const getBoardId = async (name: string): Promise<UUID> => {
        const board = await prisma.boards.findFirst({
            where: { name },
        });
        if (isNull(board)) throw Error("not found board");
        return board.id;
    };

    export const getUpdatedArticleId = async (
        board_id: string,
    ): Promise<UUID> => {
        const articles = await prisma.articles.findMany({
            where: { deleted_at: null, board_id },
            select: {
                id: true,
                _count: {
                    select: { snapshots: true },
                },
            },
        });
        return RandomGenerator.pick(
            articles.filter(({ _count: { snapshots } }) => snapshots > 1),
        ).id;
    };

    export const getDeletedArticleId = async (
        board_id: string,
    ): Promise<UUID> => {
        const articles = await prisma.articles.findMany({
            where: { deleted_at: { not: null }, board_id },
        });
        return RandomGenerator.pick(articles).id;
    };

    export const getUpdatedCommentId = async (
        article_id: string,
        parent_id: string | null = null,
    ): Promise<UUID> => {
        const articles = await prisma.comments.findMany({
            where: { deleted_at: null, article_id, parent_id },
            select: {
                id: true,
                _count: {
                    select: { snapshots: true },
                },
            },
        });
        return RandomGenerator.pick(
            articles.filter(({ _count: { snapshots } }) => snapshots > 1),
        ).id;
    };

    export const getDeletedCommentId = async (
        article_id: string,
        parent_id: string | null = null,
    ): Promise<UUID> => {
        const articles = await prisma.comments.findMany({
            where: { deleted_at: { not: null }, article_id, parent_id },
        });
        return RandomGenerator.pick(articles).id;
    };

    export const createMembership = async (
        name: string,
        rank: number,
        is_deleted = false,
    ) => {
        return prisma.memberships.create({
            data: {
                id: Random.uuid(),
                name,
                rank,
                created_at: DateMapper.toISO(),
                image_url: createNullableUrl(),
                ...(is_deleted
                    ? { deleted_at: DateMapper.toISO() }
                    : { deleted_at: null }),
            },
        });
    };

    export const createUser = async (
        name: string,
        membership: string | null,
        is_deleted = false,
    ) => {
        const user = await prisma.users.create({
            data: {
                id: Random.uuid(),
                name,
                created_at: DateMapper.toISO(),
                image_url: createNullableUrl(),
                membership_id: await getNullableMembershipId(membership),
                ...(is_deleted
                    ? { deleted_at: DateMapper.toISO() }
                    : { deleted_at: null }),
            },
        });
        await prisma.authentications.create({
            data: {
                id: Random.uuid(),
                user_id: user.id,
                oauth_type: "github",
                oauth_sub: name,
                created_at: DateMapper.toISO(),
                ...(is_deleted
                    ? { deleted_at: DateMapper.toISO() }
                    : { deleted_at: null }),
            },
        });
        await prisma.authentications.create({
            data: {
                id: Random.uuid(),
                user_id: user.id,
                oauth_type: "kakao",
                oauth_sub: name,
                created_at: DateMapper.toISO(),
                ...(is_deleted
                    ? { deleted_at: DateMapper.toISO() }
                    : { deleted_at: null }),
            },
        });
        return user;
    };

    export const createBoard = async (
        name: string,
        membership: {
            read_article_list: string | null;
            read_article: string | null;
            read_comment_list: string | null;
            write_article: string;
            write_comment: string;
            manager: string;
        },
        is_deleted = false,
    ) => {
        return prisma.boards.create({
            data: {
                id: Random.uuid(),
                name,
                description: Random.string(50),
                created_at: DateMapper.toISO(),
                ...(is_deleted
                    ? { deleted_at: DateMapper.toISO() }
                    : { deleted_at: null }),
                manager_membership_id: await getMembershipId(
                    membership.manager,
                ),
                read_article_list_membership_id: await getNullableMembershipId(
                    membership.read_article_list,
                ),
                read_article_membership_id: await getNullableMembershipId(
                    membership.read_article,
                ),
                read_comment_list_membership_id: await getNullableMembershipId(
                    membership.read_comment_list,
                ),
                write_article_membership_id: await getMembershipId(
                    membership.write_article,
                ),
                write_comment_membership_id: await getMembershipId(
                    membership.write_comment,
                ),
            },
        });
    };

    export const createArticle = async (
        {
            author,
            board,
            is_notice = false,
        }: {
            author: string;
            board: string;
            is_notice?: boolean;
        },
        {
            is_updated = false,
            is_deleted = false,
        }: {
            is_updated?: boolean;
            is_deleted?: boolean;
        },
    ) => {
        const created_at = DateMapper.toISO();

        const article = await prisma.articles.create({
            data: {
                id: Random.uuid(),
                created_at,
                ...(is_deleted
                    ? { deleted_at: DateMapper.toISO() }
                    : { deleted_at: null }),
                author_id: await getUserId(author),
                board_id: await getBoardId(board),
                is_notice,
            },
        });
        await prisma.article_snapshots.create({
            data: {
                id: Random.uuid(),
                created_at,
                title: Random.string(20),
                body_format: typia.random<ArticleBodyFormat>(),
                body_url: createUrl(),
                article_id: article.id,
            },
        });
        if (is_updated) {
            const now = new Date();
            now.setMonth(now.getMonth() + 1);
            await prisma.article_snapshots.create({
                data: {
                    id: Random.uuid(),
                    created_at: now,
                    title: Random.string(20),
                    body_format: typia.random<ArticleBodyFormat>(),
                    body_url: createUrl(),
                    article_id: article.id,
                },
            });
        }
        return article;
    };

    export const createComment = async (
        input: {
            author: string;
            article_id: string;
            parent_id: string | null;
        },
        {
            is_updated = false,
            is_deleted = false,
        }: { is_updated?: boolean; is_deleted?: boolean },
    ) => {
        const created_at = DateMapper.toISO();
        const comment = await prisma.comments.create({
            data: {
                id: Random.uuid(),
                article_id: input.article_id,
                parent_id: input.parent_id,
                author_id: await getUserId(input.author),
                created_at,
                ...(is_deleted
                    ? { deleted_at: DateMapper.toISO() }
                    : { deleted_at: null }),
            },
        });

        await prisma.comment_snapshots.create({
            data: {
                id: Random.uuid(),
                body: Random.string(100),
                created_at,
                comment_id: comment.id,
            },
        });
        if (is_updated) {
            const now = new Date();
            now.setHours(now.getHours() + 5);
            await prisma.comment_snapshots.create({
                data: {
                    id: Random.uuid(),
                    body: Random.string(100),
                    created_at: DateMapper.toISO(now),
                    comment_id: comment.id,
                },
            });
        }

        return comment;
    };

    export const deleteUser = async (id: string) => {
        await prisma.authentications.deleteMany({ where: { user_id: id } });
        await prisma.users.delete({ where: { id } });
    };

    export const deleteBoard = async (id: string) =>
        prisma.boards.delete({ where: { id } });

    export const deleteArticle = async (id: string) => {
        await prisma.article_attachment_snapshots.deleteMany({
            where: { snapshot: { article_id: id } },
        });
        await prisma.article_snapshots.deleteMany({
            where: { article_id: id },
        });
        await prisma.articles.delete({ where: { id } });
    };

    export const deleteComment = async (id: string) => {
        await prisma.comment_snapshots.deleteMany({
            where: { comment_id: id },
        });
        await prisma.comments.delete({ where: { id } });
    };

    class Size {
        private before?: {
            users: {
                total: number;
                deleted: number;
            };
            authentications: {
                total: number;
                deleted: number;
            };
            memberships: {
                total: number;
                deleted: number;
            };
            boards: {
                total: number;
                deleted: number;
            };
            articles: {
                total: number;
                deleted: number;
            };
            article_snapshots: {
                total: number;
            };
            article_attachment_snapshots: {
                total: number;
            };
            comments: {
                total: number;
                deleted: number;
            };
            comment_snapshots: {
                total: number;
            };
            attachments: {
                total: number;
            };
        };
        private async count() {
            return {
                users: {
                    total: await prisma.users.count(),
                    deleted: await prisma.users.count({
                        where: { deleted_at: { not: null } },
                    }),
                },
                authentications: {
                    total: await prisma.authentications.count(),
                    deleted: await prisma.authentications.count({
                        where: { deleted_at: { not: null } },
                    }),
                },
                memberships: {
                    total: await prisma.memberships.count(),
                    deleted: await prisma.memberships.count({
                        where: { deleted_at: { not: null } },
                    }),
                },
                boards: {
                    total: await prisma.boards.count(),
                    deleted: await prisma.boards.count({
                        where: { deleted_at: { not: null } },
                    }),
                },
                articles: {
                    total: await prisma.articles.count(),
                    deleted: await prisma.articles.count({
                        where: { deleted_at: { not: null } },
                    }),
                },
                article_snapshots: {
                    total: await prisma.article_snapshots.count(),
                },
                article_attachment_snapshots: {
                    total: await prisma.article_attachment_snapshots.count(),
                },
                comments: {
                    total: await prisma.comments.count(),
                    deleted: await prisma.comments.count({
                        where: { deleted_at: { not: null } },
                    }),
                },
                comment_snapshots: {
                    total: await prisma.comment_snapshots.count(),
                },
                attachments: {
                    total: await prisma.attachments.count(),
                },
            };
        }
        async init() {
            this.before = await this.count();
        }
        async check(): Promise<() => void> {
            const before = this.before;
            if (isUndefined(before)) throw Error("Size does not initalized");
            const after = await this.count();
            return () =>
                assert.deepStrictEqual(after, before, "size is changed");
        }
    }

    export const size = new Size();

    export const init = async () => {
        await createMembership("브론즈", 1);
        await createMembership("실버", 2);
        await createMembership("골드", 3);

        await createUser("user0", null);
        await createUser("user1", "브론즈");
        await createUser("user2", "실버");
        await createUser("user3", "골드");

        await createBoard("board1", {
            read_article_list: null,
            read_article: null,
            read_comment_list: null,
            write_article: "브론즈",
            write_comment: "브론즈",
            manager: "골드",
        });
        await Promise.all(
            Array.from({ length: 16 }, async (_, idx) => {
                const article = await createArticle(
                    {
                        author: "user1",
                        board: "board1",
                        is_notice: !!+idx.toString(2).padStart(3, "0").at(-1)!,
                    },
                    {
                        is_updated: !!+idx.toString(2).padStart(3, "0").at(-2)!,
                        is_deleted: !!+idx.toString(2).padStart(3, "0").at(-3)!,
                    },
                );
                await Promise.all(
                    Array.from({ length: 8 }, async () => {
                        const comment = await createComment(
                            {
                                author: "user2",
                                article_id: article.id,
                                parent_id: null,
                            },
                            {
                                is_updated: !!+idx
                                    .toString(2)
                                    .padStart(3, "0")
                                    .at(-1)!,
                                is_deleted: !!+idx
                                    .toString(2)
                                    .padStart(3, "0")
                                    .at(-2)!,
                            },
                        );
                        Array.from({ length: 8 }, () =>
                            createComment(
                                {
                                    author: "user3",
                                    article_id: article.id,
                                    parent_id: comment.id,
                                },
                                {
                                    is_updated: !!+idx
                                        .toString(2)
                                        .padStart(3, "0")
                                        .at(-1)!,
                                    is_deleted: !!+idx
                                        .toString(2)
                                        .padStart(3, "0")
                                        .at(-2)!,
                                },
                            ),
                        );
                    }),
                );
            }),
        );
        await createBoard("board2", {
            read_article_list: null,
            read_article: "브론즈",
            read_comment_list: "브론즈",
            write_article: "브론즈",
            write_comment: "브론즈",
            manager: "골드",
        });
        await Promise.all(
            Array.from({ length: 16 }, async (_, idx) => {
                const article = await createArticle(
                    {
                        author: "user3",
                        board: "board2",
                        is_notice: !!+idx.toString(2).padStart(3, "0").at(-1)!,
                    },
                    {
                        is_updated: !!+idx.toString(2).padStart(3, "0").at(-2)!,
                        is_deleted: !!+idx.toString(2).padStart(3, "0").at(-3)!,
                    },
                );
                await Promise.all(
                    Array.from({ length: 8 }, async () => {
                        const comment = await createComment(
                            {
                                author: "user2",
                                article_id: article.id,
                                parent_id: null,
                            },
                            {
                                is_updated: !!+idx
                                    .toString(2)
                                    .padStart(3, "0")
                                    .at(-1)!,
                                is_deleted: !!+idx
                                    .toString(2)
                                    .padStart(3, "0")
                                    .at(-2)!,
                            },
                        );
                        Array.from({ length: 8 }, () =>
                            createComment(
                                {
                                    author: "user1",
                                    article_id: article.id,
                                    parent_id: comment.id,
                                },
                                {
                                    is_updated: !!+idx
                                        .toString(2)
                                        .padStart(3, "0")
                                        .at(-1)!,
                                    is_deleted: !!+idx
                                        .toString(2)
                                        .padStart(3, "0")
                                        .at(-2)!,
                                },
                            ),
                        );
                    }),
                );
            }),
        );
        await createBoard("board3", {
            read_article_list: null,
            read_article: "브론즈",
            read_comment_list: "실버",
            write_article: "골드",
            write_comment: "골드",
            manager: "골드",
        });

        await Promise.all(
            Array.from({ length: 16 }, async (_, idx) => {
                const article = await createArticle(
                    {
                        author: "user3",
                        board: "board2",
                        is_notice: !!+idx.toString(2).padStart(3, "0").at(-1)!,
                    },
                    {
                        is_updated: !!+idx.toString(2).padStart(3, "0").at(-2)!,
                        is_deleted: !!+idx.toString(2).padStart(3, "0").at(-3)!,
                    },
                );
                await Promise.all(
                    Array.from({ length: 8 }, async () => {
                        const comment = await createComment(
                            {
                                author: "user3",
                                article_id: article.id,
                                parent_id: null,
                            },
                            {
                                is_updated: !!+idx
                                    .toString(2)
                                    .padStart(3, "0")
                                    .at(-1)!,
                                is_deleted: !!+idx
                                    .toString(2)
                                    .padStart(3, "0")
                                    .at(-2)!,
                            },
                        );
                        Array.from({ length: 8 }, () =>
                            createComment(
                                {
                                    author: "user3",
                                    article_id: article.id,
                                    parent_id: comment.id,
                                },
                                {
                                    is_updated: !!+idx
                                        .toString(2)
                                        .padStart(3, "0")
                                        .at(-1)!,
                                    is_deleted: !!+idx
                                        .toString(2)
                                        .padStart(3, "0")
                                        .at(-2)!,
                                },
                            ),
                        );
                    }),
                );
            }),
        );

        const board = await createBoard("deleted", {
            read_article_list: null,
            read_article: null,
            read_comment_list: null,
            write_article: "브론즈",
            write_comment: "브론즈",
            manager: "브론즈",
        });

        await prisma.boards.update({
            where: { id: board.id },
            data: { deleted_at: DateMapper.toISO() },
        });

        await size.init();
        console.log("seed initialized");
    };

    export const restore = async () => {
        const truncate = (table: string) =>
            prisma.$queryRaw(Prisma.raw(`TRUNCATE table ${table} cascade`));

        await prisma.$transaction([
            truncate("comment_snapshots"),
            truncate("comments"),
            truncate("article_attachment_snapshots"),
            truncate("article_snapshots"),
            truncate("articles"),
            truncate("attachments"),
            truncate("boards"),
            truncate("authentications"),
            truncate("users"),
            truncate("memberships"),
        ]);
    };
}
