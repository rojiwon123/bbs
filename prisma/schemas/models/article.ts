import psg from "@rojiwon123/prisma-schema-generator";

import { DateTime, Id, Relation } from "../../util/mixin";
import { Tag } from "../../util/tag";

psg.Model("articles", {
    index: ["created_at"],
    comments: [
        "Root Entity of Article",
        Tag.namespace(),
        Tag.namespace("Comment"),
        Tag.namespace("Article"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    ...Relation.uuid("author", { model: "users" }),
    ...Relation.uuid("board", { model: "boards" }),
    psg.Field.boolean("notice", {
        comments: ["Indicate whether a article is notification."],
    }),
    DateTime.createdAt(),
    DateTime.deletedAt(),
    psg.Field.relation("snapshots", {
        constraint: "list",
        model: "article_snapshots",
    }),
    psg.Field.relation("comments", {
        constraint: "list",
    }),
);

psg.Model("article_snapshots", {
    comments: [
        "Snapshot of Article",
        `an \`article_snapshots\` record contains the content of an article's specific version.`,
        "When a user edit an article, a new snapshot record is created, and readers will view the snapshot record linked to the most recently created version among the connected records.",
        Tag.namespace(),
        Tag.namespace("Article"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    ...Relation.uuid("article", { model: "articles" }),
    psg.Field.string("title", { comments: ["title of article"] }),
    psg.Field.string("body_url", {
        comments: ["URL path of article body resource"],
    }),
    psg.Field.enum("body_format", {
        enum: "ArticleBodyFormat",
        comments: ["one of `html`, `md`, `txt`"],
    }),
    DateTime.createdAt(),
    psg.Field.relation("article_attachment_snapshots", {
        constraint: "list",
    }),
);

psg.Model("article_attachment_snapshots", {
    comments: [
        "Attachment Snapshot for Article",
        `an \`article_attachment_snapshots\` entity connects an \`article_snapshots\` record with an \`attachments\` record.`,
        `If author add attachment to an article, a new record of \`article_attachment_snapshots\` is created.`,
        Tag.namespace(),
        Tag.namespace("Article"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    ...Relation.uuid("article_snapshot", { model: "article_snapshots" }),
    ...Relation.uuid("attachment", { model: "attachments" }),
    psg.Field.int("sequence"),
);
