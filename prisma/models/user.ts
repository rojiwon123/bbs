import { Description } from "../util/description";
import { Table } from "../util/table";

const tags = [Description.namespace("User"), Description.author()];

Table.create({
    tableName: "users",
    comments: Description.lines("Root Entity of User", ...tags),
})(
    Table.addId(),
    Table.addColumn("string")("name"),
    Table.addRelation({
        tableName: "articles",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "comments",
        options: { list: true },
    }),
);
