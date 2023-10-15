import { Description } from "../util/description";
import { Table } from "../util/table";

const tags = [Description.namespace("BBS"), Description.author()];

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
    Table.addRelationalString("comment_snapshot")("comment_snapshots"),
    Table.addRelationalString("attachment")("attachments"),
);
