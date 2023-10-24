import { OauthType } from "../enums";
import { Description } from "../util/description";
import { Table } from "../util/table";

Table.create({
    tableName: "authentications",
    comments: Description.lines(
        "Authentication Entity of User",
        Description.namespace(),
        Description.namespace("User"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("user", { optional: true })("users"),
    Table.addColumn("enum")("oauth_type", OauthType, {
        comments: Description.lines("one of `github`, `kakao`"),
    }),
    Table.addColumn("string")("oauth_sub", {
        comments: Description.lines("oauth server user id"),
    }),
    Table.addColumn("string")("email", {
        optional: true,
        comments: Description.lines("verified email"),
    }),
    Table.setCreatable,
    Table.setUpdatable,
    Table.setDeletable,
);

Table.create({
    tableName: "users",
    comments: Description.lines(
        "Root Entity of User",
        Description.namespace(),
        Description.namespace("Article"),
        Description.namespace("Comment"),
        Description.namespace("Board"),
        Description.namespace("User"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addColumn("string")("name", {
        comments: Description.lines("displayed name of user"),
    }),
    Table.addColumn("string")("image_url", {
        optional: true,
        comments: Description.lines("url of user profile image"),
    }),
    Table.addColumn("string")("introduction", {
        comments: Description.lines("user introduction"),
    }),
    Table.setCreatable,
    Table.setUpdatable,
    Table.setDeletable,
    Table.addRelation({
        tableName: "authentications",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "articles",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "comments",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "permission_groups",
        fieldName: "managed_permission_groups",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "boards",
        fieldName: "managed_boards",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "user_permissions",
        fieldName: "permissions",
        options: { list: true },
    }),
);

Table.create({
    tableName: "user_permissions",
    comments: Description.lines(
        "User's Permission",
        "If a user belong to a `permission_groups` record, a `user_permissions` record is created.",
        Description.namespace(),
        Description.namespace("User"),
        Description.namespace("Permission"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addRelationalString("user")("users"),
    Table.addRelationalString("group")("permission_groups"),
    Table.setCreatable,
    Table.setDeletable,
);
