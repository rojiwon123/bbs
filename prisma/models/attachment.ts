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
    Table.addRelation({
        tableName: "comment_snapshot_attachments",
        fieldName: "comment_snapshot_relations",
        options: { list: true },
    }),
);
