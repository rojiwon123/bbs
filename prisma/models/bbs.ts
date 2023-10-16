import { ArticleBodyFormat, ArticleStatus } from "../enums";
import { Description } from "../util/description";
import { Table } from "../util/table";

const tags = [Description.namespace("BBS"), Description.author()];

Table.create({
    tableName: "articles",
    comments: Description.lines("Root Entity of Article", ...tags),
})(
    Table.addId(),
    Table.addRelationalString("author")("users"),
    Table.addColumn("enum")("status", ArticleStatus, {
        comments: Description.lines("one of `pending`, `active`, `deleted`"),
    }),
    Table.setCreatable,
    Table.addTimestamptz("posted_at", {
        optional: true,
        comments: Description.lines("posting time of article"),
    }),
    Table.setDeletable,
    Table.addRelation({
        tableName: "article_snapshots",
        fieldName: "snapshots",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "comments",
        options: { list: true },
    }),
);

Table.create({
    tableName: "article_snapshots",
    comments: Description.lines(
        "Snapshot of Article",
        `an \`article_snapshots\` record contains the content of an article's specific version.`,
        "When a user edit an article, a new snapshot record is created, and readers will view the snapshot record linked to the most recently created version among the connected records.",
        ...tags,
    ),
})(
    Table.addId(),
    Table.addRelationalString("article")("articles"),
    Table.addColumn("string")("title", {
        comments: Description.lines("title of article"),
    }),
    Table.addColumn("string")("body_url", {
        comments: Description.lines("URL path of article body resource"),
    }),
    Table.addColumn("enum")("body_format", ArticleBodyFormat, {
        comments: Description.lines("one of `html`, `md`, `txt`"),
    }),
    Table.setCreatable,
    Table.setDeletable,
    Table.addRelation({
        tableName: "article_snapshot_attachments",
        fieldName: "attachment_relations",
        options: { list: true },
    }),
);

Table.create({
    tableName: "article_snapshot_attachments",
    comments: Description.lines(
        "Relation Attachment with Article Snapshot",
        `an \`article_snapshot_attachments\` entity connects an \`article_snapshots\` record with an \`attachments\` record.`,
        `If author add attachment to an article, a new record of \`article_snapshot_attachments\` is created.`,
        ...tags,
    ),
})(
    Table.addId(),
    Table.addRelationalString("snapshot")("article_snapshots"),
    Table.addRelationalString("attachment")("attachments"),
);

Table.create({
    tableName: "attachments",
    comments: Description.lines(
        "Attachment Entity",
        "All the attachment resources managed in the BBS",
        ...tags,
    ),
})(
    Table.addId(),
    Table.addColumn("string")("name", {
        comments: Description.lines("name of attachment resource"),
    }),
    Table.addColumn("string")("extension", {
        comments: Description.lines(
            "extension of resource like `md`, `html`, `jpeg`...",
        ),
    }),
    Table.addColumn("string")("url", {
        comments: Description.lines("URL path of real resource"),
    }),
    Table.setCreatable,
    Table.addRelation({
        tableName: "article_snapshot_attachments",
        fieldName: "article_snapshot_relations",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "comment_snapshot_attachments",
        fieldName: "comment_snapshot_relations",
        options: { list: true },
    }),
);

Table.create({
    tableName: "comments",
    comments: Description.lines("Root Entity of Comment", ...tags),
})(
    Table.addId(),
    Table.addRelationalString("author")("users"),
    Table.addRelationalString("article")("articles"),
    Table.addRelationalString("parent", {
        optional: true,
        comments: Description.lines(
            "a parent comment id in a hierarchical structure",
        ),
    })("comments", { name: "HierarchicalComment" }),
    Table.setCreatable,
    Table.setDeletable,
    Table.addRelation({
        tableName: "comment_snapshots",
        fieldName: "snapshots",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "comments",
        fieldName: "children",
        options: { list: true, name: "HierarchicalComment" },
    }),
);

Table.create({
    tableName: "comment_snapshots",
    comments: Description.lines("Snapshot of Comment", ...tags),
})(
    Table.addId(),
    Table.addRelationalString("comment")("comments"),
    Table.addColumn("string")("body"),
    Table.setCreatable,
    Table.setDeletable,
    Table.addRelation({
        tableName: "comment_snapshot_attachments",
        fieldName: "attachment_relations",
        options: { list: true },
    }),
);

Table.create({
    tableName: "comment_snapshot_attachments",
    comments: Description.lines(
        "Relation Attachment with Comment Snapshot",
        `an \`comment_snapshot_attachments\` entity connects an \`comment_snapshots\` record with an \`attachments\` record.`,
        `If author add attachment to an comment, a new record of \`comment_snapshot_attachments\` is created.`,
        ...tags,
    ),
})(
    Table.addId(),
    Table.addRelationalString("snapshot")("comment_snapshots"),
    Table.addRelationalString("attachment")("attachments"),
);
