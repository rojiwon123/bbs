import { Description } from "../util/description";
import { Table } from "../util/table";

Table.create({
    tableName: "boards",
    comments: Description.lines(
        "Root Entity of Board",
        Description.namespace(),
        Description.namespace("Board"),
        Description.namespace("Article"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addColumn("string")("name"),
    Table.addColumn("string")("description"),
    Table.addRelationalString("admin")("users"),
    Table.setCreatable,
    Table.setDeletable,
    Table.addRelation({
        tableName: "articles",
        options: { list: true },
    }),
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
);

Table.create({
    tableName: "read_article_list_permissions",
    comments: Description.lines(
        "Permission for read article list of board",
        Description.namespace(),
        Description.namespace("Board"),
        Description.namespace("Permission"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("board")("boards"),
    Table.addRelationalString("group")("permission_groups"),
    Table.setCreatable,
    Table.setDeletable,
);

Table.create({
    tableName: "read_article_permissions",
    comments: Description.lines(
        "Permission for read article of board",
        Description.namespace(),
        Description.namespace("Board"),
        Description.namespace("Permission"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("board")("boards"),
    Table.addRelationalString("group")("permission_groups"),
    Table.setCreatable,
    Table.setDeletable,
);

Table.create({
    tableName: "write_article_permissions",
    comments: Description.lines(
        "Permission for write article of board",
        Description.namespace(),
        Description.namespace("Board"),
        Description.namespace("Permission"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("board")("boards"),
    Table.addRelationalString("group")("permission_groups"),
    Table.setCreatable,
    Table.setDeletable,
);

Table.create({
    tableName: "read_comment_list_permissions",
    comments: Description.lines(
        "Permission for read comment list of board",
        Description.namespace(),
        Description.namespace("Board"),
        Description.namespace("Permission"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("board")("boards"),
    Table.addRelationalString("group")("permission_groups"),
    Table.setCreatable,
    Table.setDeletable,
);

Table.create({
    tableName: "write_comment_permissions",
    comments: Description.lines(
        "Permission for write comment of board",
        Description.namespace(),
        Description.namespace("Board"),
        Description.namespace("Permission"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("board")("boards"),
    Table.addRelationalString("group")("permission_groups"),
    Table.setCreatable,
    Table.setDeletable,
);
