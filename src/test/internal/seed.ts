import { range, toArray } from "@fxts/core";

import { prisma } from "@APP/infrastructure/DB";
import { DateMapper } from "@APP/utils/date";
import { Random } from "@APP/utils/random";

export namespace Seed {
    export const createArticle = async (author_id: string) =>
        prisma.articles.create({
            data: {
                id: Random.uuid(),
                author_id,
                created_at: DateMapper.toISO(),
                snapshots: {
                    create: {
                        id: Random.uuid(),
                        title: Random.string(10),
                        body_format: "html",
                        body_url: "http://localhost:6060",
                        created_at: DateMapper.toISO(),
                    },
                },
            },
        });

    const createSnapshot = (article_id: string, idx: number) => {
        const now = new Date();
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
            data: toArray(range(3)).map((idx) =>
                createSnapshot(article.id, idx),
            ),
        });
    };
    export const createDeletedArticle = async (author_id: string) => {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        return prisma.articles.create({
            data: {
                id: Random.uuid(),
                author_id,
                created_at: DateMapper.toISO(),
                deleted_at: DateMapper.toISO(now),
                snapshots: {
                    create: {
                        id: Random.uuid(),
                        title: Random.string(10),
                        body_format: "html",
                        body_url: "http://localhost:6060",
                        created_at: DateMapper.toISO(),
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

    export const run = async () => {
        await createArticles();
    };

    export const truncate = async () => {
        await prisma.article_snapshot_attachments.deleteMany();
        await prisma.article_snapshots.deleteMany();
        await prisma.articles.deleteMany();
        await prisma.attachments.deleteMany();

        await prisma.authentications.deleteMany();
        await prisma.users.deleteMany();
    };
}
