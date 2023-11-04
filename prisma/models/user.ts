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
    Table.addColumn("unique")({ fields: ["oauth_sub", "oauth_type"] }),
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
    Table.addRelationalString("membership", {
        optional: true,
        comments: Description.lines(
            "If null, user membership is same with unauthorized user",
        ),
    })("memberships"),
    Table.addColumn("string")("name", {
        comments: Description.lines("displayed name of user"),
    }),
    Table.addColumn("string")("image_url", {
        optional: true,
        comments: Description.lines("url of user profile image"),
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
