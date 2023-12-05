import psg from "@rojiwon123/prisma-schema-generator";

import { DateTime, Id, Relation } from "../../util/mixin";
import { Tag } from "../../util/tag";

psg.Model("boards", {
    comments: [
        "Root Entity of Board",
        Tag.namespace(),
        Tag.namespace("Board"),
        Tag.namespace("Article"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    psg.Field.string("name"),
    psg.Field.string("description"),
    ...Relation.uuid("manager_membership", {
        model: "memberships",
        name: "ManagerMembership",
    }),
    ...Relation.uuid("read_article_list_membership", {
        constraint: "nullable",
        model: "memberships",
        name: "ReadArticleListMembership",
    }),
    ...Relation.uuid("read_article_membership", {
        constraint: "nullable",
        model: "memberships",
        name: "ReadArticleMembership",
    }),
    ...Relation.uuid("write_article_membership", {
        model: "memberships",
        name: "WriteArticleMembership",
    }),
    ...Relation.uuid("read_comment_list_membership", {
        constraint: "nullable",
        model: "memberships",
        name: "ReadCommentListMembership",
    }),
    ...Relation.uuid("write_comment_membership", {
        model: "memberships",
        name: "WriteCommentMembership",
    }),
    DateTime.createdAt(),
    DateTime.deletedAt(),
    psg.Field.relation("articles", { constraint: "list" }),
);
