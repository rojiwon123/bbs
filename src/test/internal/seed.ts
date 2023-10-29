import { isNull } from "@fxts/core";
import typia from "typia";

import { prisma } from "@APP/infrastructure/DB";
import { DateMapper } from "@APP/utils/date";
import { Random } from "@APP/utils/random";

import { ArticleBodyFormat } from "../../../db/edge";

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
            where: { name, deleted_at: null },
        });
        if (isNull(board)) throw Error("not found board");
        return board.id;
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

    export const count = async () => ({
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
    });

    export const init = async () => {
        await createMembership("브론즈", 1);
        await createMembership("실버", 2);
        await createMembership("골드", 3);
        await createMembership("플레티넘", 4);
        await createMembership("에메랄드", 5);
        await createMembership("다이아", 6);

        await createUser("user0", null);
        await createUser("user1", "브론즈");
        await createUser("user2", "실버");
        await createUser("user3", "골드");
        await createUser("user4", "플레티넘");
        await createUser("user5", "에메랄드");
        await createUser("user6", "다이아");

        await createBoard("board1", {
            read_article_list: null,
            read_article: null,
            read_comment_list: null,
            write_article: "브론즈",
            write_comment: "브론즈",
            manager: "다이아",
        });
        await Promise.all(
            Array.from({ length: 50 }, async () => {
                const article = await createArticle(
                    {
                        author: "user1",
                        board: "board1",
                        is_notice: Random.int({ min: 0, max: 4 }) < 2,
                    },
                    {
                        is_updated: Random.int({ min: 0, max: 4 }) < 2,
                        is_deleted: Random.int({ min: 0, max: 4 }) < 2,
                    },
                );
                await Promise.all(
                    Array.from({ length: 20 }, async () => {
                        const comment = await createComment(
                            {
                                author: "user2",
                                article_id: article.id,
                                parent_id: null,
                            },
                            {
                                is_updated: Random.int({ min: 0, max: 4 }) < 2,
                                is_deleted: Random.int({ min: 0, max: 4 }) < 2,
                            },
                        );
                        Array.from({ length: 20 }, () =>
                            createComment(
                                {
                                    author: "user3",
                                    article_id: article.id,
                                    parent_id: comment.id,
                                },
                                {
                                    is_updated:
                                        Random.int({ min: 0, max: 4 }) < 2,
                                    is_deleted:
                                        Random.int({ min: 0, max: 4 }) < 2,
                                },
                            ),
                        );
                    }),
                );
            }),
        );
        await createBoard("board2", {
            read_article_list: "골드",
            read_article: "골드",
            read_comment_list: "골드",
            write_article: "골드",
            write_comment: "골드",
            manager: "다이아",
        });
        await Promise.all(
            Array.from({ length: 50 }, async () => {
                const article = await createArticle(
                    {
                        author: "user4",
                        board: "board2",
                        is_notice: Random.int({ min: 0, max: 4 }) < 2,
                    },
                    {
                        is_updated: Random.int({ min: 0, max: 4 }) < 2,
                        is_deleted: Random.int({ min: 0, max: 4 }) < 2,
                    },
                );
                await Promise.all(
                    Array.from({ length: 20 }, async () => {
                        const comment = await createComment(
                            {
                                author: "user6",
                                article_id: article.id,
                                parent_id: null,
                            },
                            {
                                is_updated: Random.int({ min: 0, max: 4 }) < 2,
                                is_deleted: Random.int({ min: 0, max: 4 }) < 2,
                            },
                        );
                        Array.from({ length: 20 }, () =>
                            createComment(
                                {
                                    author: "user5",
                                    article_id: article.id,
                                    parent_id: comment.id,
                                },
                                {
                                    is_updated:
                                        Random.int({ min: 0, max: 4 }) < 2,
                                    is_deleted:
                                        Random.int({ min: 0, max: 4 }) < 2,
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
            read_comment_list: "브론즈",
            write_article: "실버",
            write_comment: "실버",
            manager: "다이아",
        });
        await Promise.all(
            Array.from({ length: 50 }, async () => {
                const article = await createArticle(
                    {
                        author: "user3",
                        board: "board3",
                        is_notice: Random.int({ min: 0, max: 4 }) < 2,
                    },
                    {
                        is_updated: Random.int({ min: 0, max: 4 }) < 2,
                        is_deleted: Random.int({ min: 0, max: 4 }) < 2,
                    },
                );
                await Promise.all(
                    Array.from({ length: 20 }, async () => {
                        const comment = await createComment(
                            {
                                author: "user2",
                                article_id: article.id,
                                parent_id: null,
                            },
                            {
                                is_updated: Random.int({ min: 0, max: 4 }) < 2,
                                is_deleted: Random.int({ min: 0, max: 4 }) < 2,
                            },
                        );
                        Array.from({ length: 20 }, () =>
                            createComment(
                                {
                                    author: "user4",
                                    article_id: article.id,
                                    parent_id: comment.id,
                                },
                                {
                                    is_updated:
                                        Random.int({ min: 0, max: 4 }) < 2,
                                    is_deleted:
                                        Random.int({ min: 0, max: 4 }) < 2,
                                },
                            ),
                        );
                    }),
                );
            }),
        );
        await createBoard("board4", {
            read_article_list: "브론즈",
            read_article: "실버",
            read_comment_list: "골드",
            write_article: "골드",
            write_comment: "골드",
            manager: "다이아",
        });
        await Promise.all(
            Array.from({ length: 50 }, async () => {
                const article = await createArticle(
                    {
                        author: "user6",
                        board: "board4",
                        is_notice: Random.int({ min: 0, max: 4 }) < 2,
                    },
                    {
                        is_updated: Random.int({ min: 0, max: 4 }) < 2,
                        is_deleted: Random.int({ min: 0, max: 4 }) < 2,
                    },
                );
                await Promise.all(
                    Array.from({ length: 20 }, async () => {
                        const comment = await createComment(
                            {
                                author: "user5",
                                article_id: article.id,
                                parent_id: null,
                            },
                            {
                                is_updated: Random.int({ min: 0, max: 4 }) < 2,
                                is_deleted: Random.int({ min: 0, max: 4 }) < 2,
                            },
                        );
                        Array.from({ length: 20 }, () =>
                            createComment(
                                {
                                    author: "user3",
                                    article_id: article.id,
                                    parent_id: comment.id,
                                },
                                {
                                    is_updated:
                                        Random.int({ min: 0, max: 4 }) < 2,
                                    is_deleted:
                                        Random.int({ min: 0, max: 4 }) < 2,
                                },
                            ),
                        );
                    }),
                );
            }),
        );
    };

    export const restore = async () => {
        await prisma.comment_snapshots.deleteMany();
        await prisma.comments.deleteMany();

        await prisma.article_attachment_snapshots.deleteMany();
        await prisma.article_snapshots.deleteMany();
        await prisma.articles.deleteMany();

        await prisma.attachments.deleteMany();

        await prisma.boards.deleteMany();

        await prisma.authentications.deleteMany();
        await prisma.users.deleteMany();

        await prisma.memberships.deleteMany();
    };
}
