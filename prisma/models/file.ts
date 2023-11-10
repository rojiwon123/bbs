import { Description } from "../util/description";
import { Table } from "../util/table";

Table.create({
    tableName: "attachments",
    comments: Description.lines(
        "Attachment Entity",
        "All the attachment resources managed in the BBS",
        Description.namespace(),
        Description.namespace("Article"),
        Description.author(),
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
        tableName: "article_attachment_snapshots",
        options: { list: true },
    }),
);
