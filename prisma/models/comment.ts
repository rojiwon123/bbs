import { Description } from "../util/description";
import { Table } from "../util/table";

const tags = [Description.namespace("BBS"), Description.author()];

Table.create({
    tableName: "comments",
    comments: Description.lines("Root Entity of Article Comment", ...tags),
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
    comments: Description.lines("Snapshot of Article Comment", ...tags),
})(
    Table.addId(),
    Table.addRelationalString("comment")("comments"),
    Table.addColumn("string")("body"),
    Table.setCreatable,
    Table.setDeletable,
);
