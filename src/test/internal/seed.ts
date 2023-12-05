import { isNull, isUndefined } from "@fxts/core";
import { RandomGenerator } from "@nestia/e2e";
import assert from "assert";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { Entity } from "@APP/utils/fx";
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

    export const getArticleId = async (board_id: UUID): Promise<UUID> => {
        const articles = await prisma.articles.findMany({
            where: { board_id, deleted_at: null },
            select: {
                id: true,
                _count: {
                    select: { snapshots: true },
                },
            },
        });
        return RandomGenerator.pick(
            articles.filter(({ _count: { snapshots } }) => snapshots === 1),
        ).id;
    };

    export const getUpdatedArticleId = async (
        board_id: UUID,
    ): Promise<UUID> => {
        const articles = await prisma.articles.findMany({
            where: { board_id, deleted_at: null },
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
            where: { board_id, deleted_at: { not: null } },
        });
        return RandomGenerator.pick(articles).id;
    };

    export const getCommentId = async (
        article_id: string,
        parent_id: string | null = null,
    ): Promise<UUID> => {
        const comments = await prisma.comments.findMany({
            where: { article_id, parent_id, deleted_at: null },
            select: { id: true, _count: { select: { snapshots: true } } },
        });

        return RandomGenerator.pick(
            comments.filter(({ _count: { snapshots } }) => snapshots === 1),
        ).id;
    };

    export const getUpdatedCommentId = async (
        article_id: string,
        parent_id: string | null = null,
    ): Promise<UUID> => {
        const articles = await prisma.comments.findMany({
            where: { article_id, parent_id, deleted_at: null },
            select: { id: true, _count: { select: { snapshots: true } } },
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
            where: { article_id, parent_id, deleted_at: { not: null } },
        });
        return RandomGenerator.pick(articles).id;
    };

    export const createMembership = async (
        name: string,
        rank: number,
        is_deleted = false,
    ) => {
        const now = new Date();
        now.setMinutes(
            now.getMinutes() - Random.int({ min: 10, max: 100_0000 }),
        );
        return prisma.memberships.create({
            data: {
                id: Random.uuid(),
                name,
                rank,
                created_at: now,
                image_url: createNullableUrl(),
                deleted_at: is_deleted ? now : null,
            },
        });
    };

    export const createUser = async (
        name: string,
        membership: string | null,
        is_deleted = false,
    ) => {
        const now = new Date();
        now.setMinutes(
            now.getMinutes() - Random.int({ min: 10, max: 100_0000 }),
        );
        const user = await prisma.users.create({
            data: {
                id: Random.uuid(),
                name,
                created_at: now,
                image_url: createNullableUrl(),
                membership_id: await getNullableMembershipId(membership),
                deleted_at: is_deleted ? now : null,
            },
        });
        await prisma.authentications.create({
            data: {
                id: Random.uuid(),
                user_id: user.id,
                oauth_type: "github",
                oauth_sub: name,
                created_at: now,
                deleted_at: is_deleted ? now : null,
            },
        });
        await prisma.authentications.create({
            data: {
                id: Random.uuid(),
                user_id: user.id,
                oauth_type: "kakao",
                oauth_sub: name,
                created_at: now,
                deleted_at: is_deleted ? now : null,
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
        const now = new Date();
        now.setMinutes(
            now.getMinutes() - Random.int({ min: 10, max: 100_0000 }),
        );
        return prisma.boards.create({
            data: {
                id: Random.uuid(),
                name,
                description: Random.string(50),
                created_at: now,
                deleted_at: is_deleted ? now : null,
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
            notice = false,
        }: {
            author: string;
            board: string;
            notice?: boolean;
        },
        {
            is_updated = false,
            is_deleted = false,
        }: {
            is_updated?: boolean;
            is_deleted?: boolean;
        },
    ) => {
        const now = new Date();
        now.setMinutes(
            now.getMinutes() - Random.int({ min: 10, max: 100_0000 }),
        );
        const article = await prisma.articles.create({
            data: {
                id: Random.uuid(),
                created_at: now,
                deleted_at: is_deleted ? now : null,
                author_id: await getUserId(author),
                board_id: await getBoardId(board),
                notice,
            },
        });
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
        if (is_updated) {
            now.setMinutes(now.getMinutes() + 5);
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
        const now = new Date();
        now.setMinutes(
            now.getMinutes() - Random.int({ min: 10, max: 100_0000 }),
        );
        const comment = await prisma.comments.create({
            data: {
                id: Random.uuid(),
                article_id: input.article_id,
                parent_id: input.parent_id,
                author_id: await getUserId(input.author),
                created_at: now,
                deleted_at: is_deleted ? now : null,
            },
        });

        await prisma.comment_snapshots.create({
            data: {
                id: Random.uuid(),
                body: Random.string(100),
                created_at: now,
                comment_id: comment.id,
            },
        });
        if (is_updated) {
            now.setMinutes(now.getMinutes() + 5);
            await prisma.comment_snapshots.create({
                data: {
                    id: Random.uuid(),
                    body: Random.string(100),
                    created_at: now,
                    comment_id: comment.id,
                },
            });
        }

        return comment;
    };

    export const deleteUser = async (name: string) => {
        await prisma.authentications.deleteMany({ where: { user: { name } } });
        await prisma.users.deleteMany({ where: { name } });
    };

    export const deleteBoard = async (id: string) =>
        prisma.boards.delete({ where: { id } });

    export const deleteArticle = async (id: string) => {
        await prisma.article_attachment_snapshots.deleteMany({
            where: { article_snapshot_id: id },
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

    export const check_size_changed = async () => (await size.check())();

    export const init = async () => {
        console.time("seed init");
        await Promise.all([
            createMembership("브론즈", 1),
            createMembership("실버", 2),
            createMembership("골드", 3),
        ]);
        const [board1, board2, board3] = await Promise.all([
            createBoard("board1", {
                read_article_list: null,
                read_article: null,
                read_comment_list: null,
                write_article: "브론즈",
                write_comment: "브론즈",
                manager: "골드",
            }),
            createBoard("board2", {
                read_article_list: "브론즈",
                read_article: "브론즈",
                read_comment_list: "브론즈",
                write_article: "실버",
                write_comment: "실버",
                manager: "골드",
            }),
            createBoard("board3", {
                read_article_list: "브론즈",
                read_article: "실버",
                read_comment_list: "실버",
                write_article: "골드",
                write_comment: "골드",
                manager: "골드",
            }),
            createBoard(
                "deleted",
                {
                    read_article_list: null,
                    read_article: null,
                    read_comment_list: null,
                    write_article: "브론즈",
                    write_comment: "브론즈",
                    manager: "브론즈",
                },
                true,
            ),
            createUser("user0", null),
            createUser("user1", "브론즈"),
            createUser("user2", "실버"),
            createUser("user3", "골드"),
        ]);

        const articles = (
            await Promise.all([
                ...Array.from({ length: 32 }, (_, idx) =>
                    createArticle(
                        {
                            author: "user1",
                            board: "board1",
                            notice: !!+idx.toString(2).padStart(3, "0").at(-1)!,
                        },
                        {
                            is_updated: !!+idx
                                .toString(2)
                                .padStart(3, "0")
                                .at(-2)!,
                            is_deleted: !!+idx
                                .toString(2)
                                .padStart(3, "0")
                                .at(-3)!,
                        },
                    ),
                ),
                ...Array.from({ length: 16 }, (_, idx) =>
                    createArticle(
                        {
                            author: "user3",
                            board: "board2",
                            notice: !!+idx.toString(2).padStart(3, "0").at(-1)!,
                        },
                        {
                            is_updated: !!+idx
                                .toString(2)
                                .padStart(3, "0")
                                .at(-2)!,
                            is_deleted: !!+idx
                                .toString(2)
                                .padStart(3, "0")
                                .at(-3)!,
                        },
                    ),
                ),
                ...Array.from({ length: 16 }, (_, idx) =>
                    createArticle(
                        {
                            author: "user3",
                            board: "board3",
                            notice: !!+idx.toString(2).padStart(3, "0").at(-1)!,
                        },
                        {
                            is_updated: !!+idx
                                .toString(2)
                                .padStart(3, "0")
                                .at(-2)!,
                            is_deleted: !!+idx
                                .toString(2)
                                .padStart(3, "0")
                                .at(-3)!,
                        },
                    ),
                ),
            ])
        ).filter(Entity.exist);

        const board1_articles = articles.filter(
            (article) => article.board_id === board1.id,
        );

        const board2_articles = articles.filter(
            (article) => article.board_id === board2.id,
        );

        const board3_articles = articles.filter(
            (article) => article.board_id === board3.id,
        );

        const board1_parents = await Promise.all(
            board1_articles
                .map((article) =>
                    Array.from({ length: 32 }, (_, idx) =>
                        createComment(
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
                        ),
                    ),
                )
                .flat(1),
        );
        const board2_parents = await Promise.all(
            board2_articles
                .map((article) =>
                    Array.from({ length: 16 }, (_, idx) =>
                        createComment(
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
                        ),
                    ),
                )
                .flat(1),
        );
        const board3_parents = await Promise.all(
            board3_articles
                .map((article) =>
                    Array.from({ length: 16 }, (_, idx) =>
                        createComment(
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
                        ),
                    ),
                )
                .flat(1),
        );

        await Promise.all([
            ...board1_parents
                .filter(Entity.exist)
                .map((comment) =>
                    Array.from({ length: 32 }, (_, idx) =>
                        createComment(
                            {
                                author: "user1",
                                article_id: comment.article_id,
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
                    ),
                )
                .flat(1),
            ...board2_parents
                .filter(Entity.exist)
                .map((comment) =>
                    Array.from({ length: 16 }, (_, idx) =>
                        createComment(
                            {
                                author: "user1",
                                article_id: comment.article_id,
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
                    ),
                )
                .flat(1),
            ...board3_parents
                .filter(Entity.exist)
                .map((comment) =>
                    Array.from({ length: 16 }, (_, idx) =>
                        createComment(
                            {
                                author: "user3",
                                article_id: comment.article_id,
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
                    ),
                )
                .flat(1),
        ]);

        await size.init();
        console.timeEnd("seed init");
    };

    export const restore = async () => {
        const truncate = (table: string) =>
            prisma.$queryRaw(Prisma.raw(`TRUNCATE table ${table} cascade`));

        console.time("seed reset");
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
        console.timeEnd("seed reset");
    };
}
