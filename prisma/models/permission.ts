import { Description } from "../util/description";
import { Table } from "../util/table";

Table.create({
    tableName: "permission_groups",
    comments: Description.lines(
        "Permission Group Entity",
        "If user belong to a `permission_groups` record, user have permission on the group",
        "e.g., `read article`, `write article`, `read comment`, `write comment`",
        Description.namespace(),
        Description.namespace("Permission"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addColumn("string")("name"),
    Table.addRelationalString("admin")("users"),
    Table.setCreatable,
    Table.setDeletable,
    Table.addRelation({
        tableName: "read_article_list_permissions",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "read_article_permissions",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "write_article_permissions",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "read_comment_list_permissions",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "write_comment_permissions",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "user_permissions",
        fieldName: "users",
        options: { list: true },
    }),
);
