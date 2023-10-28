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
    Table.addRelationalString("manager_membership")("memberships", {
        name: "ManagerMembership",
    }),
    Table.addRelationalString("read_article_list_membership", {
        optional: true,
    })("memberships", { name: "ReadArticleListMembership" }),
    Table.addRelationalString("read_article_membership", { optional: true })(
        "memberships",
        { name: "ReadArticleMembership" },
    ),
    Table.addRelationalString("write_article_membership")("memberships", {
        name: "WriteArticleMembership",
    }),
    Table.addRelationalString("read_comment_list_membership", {
        optional: true,
    })("memberships", { name: "ReadCommentListMembership" }),
    Table.addRelationalString("write_comment_membership")("memberships", {
        name: "WriteCommentMembership",
    }),
    Table.setCreatable,
    Table.setDeletable,
    Table.addRelation({
        tableName: "articles",
        options: { list: true },
    }),
);
