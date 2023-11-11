import { ArticleBodyFormat } from "../enums";
import { Description } from "../util/description";
import { Table } from "../util/table";

Table.create({
    tableName: "articles",
    comments: Description.lines(
        "Root Entity of Article",
        Description.namespace(),
        Description.namespace("Comment"),
        Description.namespace("Article"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("author")("users"),
    Table.addRelationalString("board")("boards"),
    Table.addColumn("boolean")("is_notice", {
        comments: Description.lines("If true, a article is notification."),
    }),
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
    Table.addRelation({
        tableName: "article_attachments",
        fieldName: "attachments",
        options: { list: true },
    }),
);

Table.create({
    tableName: "article_snapshots",
    comments: Description.lines(
        "Snapshot of Article",
        `an \`article_snapshots\` record contains the content of an article's specific version.`,
        "When a user edit an article, a new snapshot record is created, and readers will view the snapshot record linked to the most recently created version among the connected records.",
        Description.namespace(),
        Description.namespace("Article"),
        Description.author(),
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
);

Table.create({
    tableName: "article_attachments",
    comments: Description.lines(
        "Attachment for Article",
        `an \`article_attachments\` entity connects an \`articles\` record with an \`attachments\` record.`,
        `If author add attachment to an article, a new record of \`article_attachments\` is created.`,
        Description.namespace(),
        Description.namespace("Article"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("article")("articles"),
    Table.addRelationalString("attachment")("attachments"),
);
