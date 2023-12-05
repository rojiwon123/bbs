import psg from "@rojiwon123/prisma-schema-generator";

import { DateTime, Id } from "../../util/mixin";
import { Tag } from "../../util/tag";

psg.Model("memberships", {
    comments: [
        "Membership Entity",
        "a user can receive one or zero membership, which signifies their permission level in the BBS.",
        Tag.namespace(),
        Tag.namespace("Board"),
        Tag.namespace("User"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    psg.Field.string("name", { comments: ["displated name of membership"] }),
    psg.Field.int("rank", {
        comments: ["`rank` is used for membership grade comparison"],
    }),
    psg.Field.string("image_url", { constraint: "nullable" }),
    DateTime.createdAt(),
    DateTime.updatedAt(),
    DateTime.deletedAt(),
    psg.Field.relation("users", { constraint: "list" }),
    psg.Field.relation("readable_article_list_boards", {
        constraint: "list",
        model: "boards",
        name: "ReadArticleListMembership",
    }),
    psg.Field.relation("readable_article_boards", {
        constraint: "list",
        model: "boards",
        name: "ReadArticleMembership",
    }),
    psg.Field.relation("writable_article_boards", {
        constraint: "list",
        model: "boards",
        name: "WriteArticleMembership",
    }),
    psg.Field.relation("readable_comment_list_boards", {
        constraint: "list",
        model: "boards",
        name: "ReadCommentListMembership",
    }),
    psg.Field.relation("writable_comment_boards", {
        constraint: "list",
        model: "boards",
        name: "WriteCommentMembership",
    }),
    psg.Field.relation("managed_boards", {
        constraint: "list",
        model: "boards",
        name: "ManagerMembership",
    }),
);
