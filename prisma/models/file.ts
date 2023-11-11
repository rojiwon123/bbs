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
    Table.addRelationalString("owner")("users", {
        comments: Description.lines(
            "`attachment` file can only be attached by the owner",
        ),
    }),
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
    Table.setDeletable,
    Table.addRelation({
        tableName: "article_attachments",
        fieldName: "articles",
        options: { list: true },
    }),
);
