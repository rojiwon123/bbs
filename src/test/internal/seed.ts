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

    const createSnapshot = (
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
                createSnapshot(article.id, article.created_at, idx),
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
    export const createArticles = async () => {
        const author = await prisma.users.create({
            data: {
                id: Random.uuid(),
                name: "author1",
                image_url:
                    "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?w=1800&t=st=1697730676~exp=1697731276~hmac=1eadeaab4aaebf576d323a3c35216c2f28f4c776a65871d0f18918edb141d183",
                introduction: "hello world",
                created_at: DateMapper.toISO(),
            },
        });
        await Promise.all([
            ...toArray(range(3)).map(() => createArticle(author.id)),
            ...toArray(range(3)).map(() => createDeletedArticle(author.id)),
            ...toArray(range(4)).map(() => createUpdatedArticle(author.id)),
            ...toArray(range(3)).map(() => createArticle(author.id)),
        ]);
    };

    export const deleteArticle = async (article_id: string) => {
        await prisma.article_snapshot_attachments.deleteMany({
            where: { snapshot: { article_id } },
        });
        await prisma.article_snapshots.deleteMany({ where: { article_id } });
        await prisma.articles.delete({ where: { id: article_id } });
    };

    export const run = async () => {
        await createUser("testuser1");
        await createArticles();
    };

    export const truncate = async () => {
        console.log("user count", await prisma.users.count());
        console.log("article count", await prisma.articles.count());
        await prisma.article_snapshot_attachments.deleteMany();
        await prisma.article_snapshots.deleteMany();
        await prisma.articles.deleteMany();
        await prisma.attachments.deleteMany();

        await prisma.authentications.deleteMany();
        await prisma.users.deleteMany();
    };
}
