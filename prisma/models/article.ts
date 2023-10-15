import { ArticleBodyFormatType } from "../enums";
import { Description } from "../util/description";
import { Table } from "../util/table";

const tags = [Description.namespace("BBS"), Description.author()];

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
);

Table.create({
    tableName: "articles",
    comments: Description.lines("Root Entity of Article", ...tags),
})(
    Table.addId(),
    Table.addRelationalString("author")("users"),
    Table.setCreatable,
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
    Table.addColumn("enum")("body_format", ArticleBodyFormatType, {
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
    Table.addRelationalString("article_snapshot")("article_snapshots"),
    Table.addRelationalString("attachment")("attachments"),
);
