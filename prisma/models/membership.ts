import { Description } from "../util/description";
import { Table } from "../util/table";

Table.create({
    tableName: "memberships",
    comments: Description.lines(
        "Membership Entity",
        "a user can receive one or zero membership, which signifies their permission level in the BBS.",
        Description.namespace(),
        Description.namespace("Board"),
        Description.namespace("User"),
        Description.author(),
    ),
})(
    Table.addId(),
    Table.addColumn("string")("name", {
        comments: Description.lines("displayed name of membership"),
    }),
    Table.addColumn("int")("rank", {
        comments: Description.lines(
            "`rank` is used for membership grade comparison",
        ),
    }),
    Table.addColumn("string")("image_url", { optional: true }),
    Table.setCreatable,
    Table.setDeletable,
    Table.addRelation({
        tableName: "users",
        options: { list: true },
    }),
    Table.addRelation({
        tableName: "boards",
        fieldName: "readable_article_list_boards",
        options: { list: true, name: "ReadArticleListMembership" },
    }),
    Table.addRelation({
        tableName: "boards",
        fieldName: "readable_article_boards",
        options: { list: true, name: "ReadArticleMembership" },
    }),
    Table.addRelation({
        tableName: "boards",
        fieldName: "writable_article_boards",
        options: { list: true, name: "WriteArticleMembership" },
    }),
    Table.addRelation({
        tableName: "boards",
        fieldName: "readable_comment_list_boards",
        options: { list: true, name: "ReadCommentListMembership" },
    }),
    Table.addRelation({
        tableName: "boards",
        fieldName: "writable_comment_boards",
        options: { list: true, name: "WriteCommentMembership" },
    }),
    Table.addRelation({
        tableName: "boards",
        fieldName: "managed_boards",
        options: { list: true, name: "ManagerMembership" },
    }),
);
