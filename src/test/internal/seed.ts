import { range, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { DateMapper } from "@APP/utils/date";
import { Random } from "@APP/utils/random";

export namespace Seed {
    export const createUser = async (name: string) => {
        const user = await prisma.users.create({
            data: {
                id: Random.uuid(),
                name,
                image_url:
                    "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?w=1800&t=st=1697730676~exp=1697731276~hmac=1eadeaab4aaebf576d323a3c35216c2f28f4c776a65871d0f18918edb141d183",
                introduction: "hello world",
                created_at: DateMapper.toISO(),
            },
        });
        await prisma.authentications.create({
            data: {
                id: Random.uuid(),
                oauth_sub: name,
                oauth_type: "github",
                created_at: DateMapper.toISO(),
                user_id: user.id,
            },
        });
        await prisma.authentications.create({
            data: {
                id: Random.uuid(),
                oauth_sub: name,
                oauth_type: "kakao",
                created_at: DateMapper.toISO(),
                user_id: user.id,
            },
        });
        return user;
    };
    export const createArticle = async (author_id: string) => {
        const created_at = Random.iso();
        return prisma.articles.create({
            data: {
                id: Random.uuid(),
                author_id,
                created_at,
                snapshots: {
                    create: {
                        id: Random.uuid(),
                        title: Random.string(10),
                        body_format: "html",
                        body_url: "http://localhost:6060",
                        created_at,
                    },
                },
            },
        });
    };

    const createArticleSnapshot = (
        article_id: string,
        posted_at: Date,
        idx: number,
    ) => {
        const now = new Date(posted_at);
        now.setHours(now.getHours() + idx);
        return {
            id: Random.uuid(),
            article_id,
            title: Random.string(10),
            body_format: "html" as const,
            body_url: "http://localhost:6060",
            created_at: DateMapper.toISO(now),
        };
    };
    export const createUpdatedArticle = async (author_id: string) => {
        const article = await createArticle(author_id);

        return prisma.article_snapshots.createMany({
            data: toArray(range(1, 4)).map((idx) =>
                createArticleSnapshot(article.id, article.created_at, idx),
            ),
        });
    };
    export const createDeletedArticle = async (author_id: string) => {
        const now = Random.iso();
        const deleted_at = new Date(now);
        deleted_at.setHours(deleted_at.getHours() + 3);
        return prisma.articles.create({
            data: {
                id: Random.uuid(),
                author_id,
                created_at: now,
                deleted_at: DateMapper.toISO(deleted_at),
                snapshots: {
                    create: {
                        id: Random.uuid(),
                        title: Random.string(10),
                        body_format: "html",
                        body_url: "http://localhost:6060",
                        created_at: now,
                    },
                },
            },
        });
    };
    export const createArticles = async (author_id: string) => {
        await Promise.all([
            ...toArray(range(3)).map(() => createArticle(author_id)),
            ...toArray(range(3)).map(() => createDeletedArticle(author_id)),
            ...toArray(range(4)).map(() => createUpdatedArticle(author_id)),
            ...toArray(range(2)).map(() => createArticle(author_id)),
        ]);
    };

    export const deleteArticle = async (article_id: string) => {
        await prisma.article_snapshot_attachments.deleteMany({
            where: { snapshot: { article_id } },
        });
        await prisma.article_snapshots.deleteMany({ where: { article_id } });
        await prisma.articles.delete({ where: { id: article_id } });
    };

    export const createComment = async (
        article_id: string,
        author_id: string,
    ) => {
        const created_at = Random.iso();
        return prisma.comments.create({
            data: {
                id: Random.uuid(),
                author_id,
                article_id,
                created_at,
                snapshots: {
                    create: {
                        id: Random.uuid(),
                        body: Random.string(200),
                        created_at,
                    },
                },
            },
        });
    };
    const createCommentSnapshot = (
        comment_id: string,
        created_at: Date,
        idx: number,
    ) => {
        const now = new Date(created_at);
        now.setHours(now.getHours() + idx);
        return {
            id: Random.uuid(),
            comment_id,
            body: Random.string(100),
            created_at: DateMapper.toISO(now),
        };
    };
    export const createUpdatedComment = async (
        article_id: string,
        author_id: string,
    ) => {
        const comment = await createComment(article_id, author_id);

        return prisma.comment_snapshots.createMany({
            data: toArray(range(1, 4)).map((idx) =>
                createCommentSnapshot(comment.id, comment.created_at, idx),
            ),
        });
    };
    export const createDeletedComment = (
        article_id: string,
        author_id: string,
    ) => {
        const created_at = Random.iso();
        const deleted_at = new Date(created_at);
        deleted_at.setHours(deleted_at.getHours() + 3);
        return prisma.comments.create({
            data: {
                id: Random.uuid(),
                article_id,
                author_id,
                created_at,
                deleted_at: DateMapper.toISO(deleted_at),
                snapshots: {
                    create: {
                        id: Random.uuid(),
                        body: Random.string(100),
                        created_at,
                    },
                },
            },
        });
    };
    export const deletedComment = async (comment_id: string) => {
        await prisma.comment_snapshots.deleteMany({
            where: { comment_id },
        });
        await prisma.comments.delete({ where: { id: comment_id } });
    };
    export const createComments = async (
        article_id: string,
        author_id: string,
    ) => {
        await Promise.all([
            ...toArray(range(3)).map(() =>
                createComment(article_id, author_id),
            ),
            ...toArray(range(4)).map(() =>
                createUpdatedComment(article_id, author_id),
            ),
            ...toArray(range(3)).map(() =>
                createDeletedComment(article_id, author_id),
            ),
            ...toArray(range(3)).map(() =>
                createComment(article_id, author_id),
            ),
        ]);
    };

    export const run = async () => {
        const author1 = await createUser("author1");
        const author2 = await createUser("author2");
        await createUser("testuser1");
        await createArticles(author1.id);
        const article = await createArticle(author1.id);
        await createComments(article.id, author2.id);
    };

    const seed_size_analyze = async (
        name: string,
        expected: number,
        actual: Promise<number>,
    ) => {
        const changed = (await actual) - expected;
        if (changed === 0) return;
        console.log(`${name} size changed: ${changed}`);
    };

    export const truncate = async () => {
        await seed_size_analyze("user", 3, prisma.users.count());
        await seed_size_analyze("article", 13, prisma.articles.count());
        await seed_size_analyze("comment", 13, prisma.comments.count());

        await prisma.comment_snapshots.deleteMany();
        await prisma.comments.deleteMany();

        await prisma.article_snapshot_attachments.deleteMany();
        await prisma.article_snapshots.deleteMany();
        await prisma.articles.deleteMany();
        await prisma.attachments.deleteMany();

        await prisma.authentications.deleteMany();
        await prisma.users.deleteMany();
    };
}
