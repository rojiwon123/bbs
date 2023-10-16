import { OauthType } from "../enums";
import { Description } from "../util/description";
import { Table } from "../util/table";

const tags = [Description.namespace("User"), Description.author()];

Table.create({
    tableName: "authentications",
    comments: Description.lines("Authentication Entity of User", ...tags),
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
        "Root Entity of User Profile",
        Description.namespace("BBS"),
        ...tags,
    ),
})(
    Table.addId(),
    Table.addColumn("string")("name", {
        comments: Description.lines("displayed name of user"),
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
);
