import { Description } from "../util/description";
import { Table } from "../util/table";

Table.create({
    tableName: "comments",
    comments: Description.lines(
        "Root Entity of Comment",
        "a user can comment short text on article or other comment",
        Description.namespace(),
        Description.namespace("Article"),
        Description.namespace("Comment"),
        Description.author(),
    ),
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
    comments: Description.lines(
        "Snapshot of Comment",
        "an `comment_snapshots` record contains the content of an comment's specific version.",
        "When a user edit an comment, a new snapshot record is created, and readers will view the snapshot record linked to the most recently created version among the connected records.",
        Description.namespace(),
        Description.namespace("Comment"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("comment")("comments"),
    Table.addColumn("string")("body"),
    Table.setCreatable,
);
