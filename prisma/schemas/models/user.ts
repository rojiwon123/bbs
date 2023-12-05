import { Field, Model } from "@rojiwon123/prisma-schema-generator";

import { DateTime, Id, Relation } from "../../util/mixin";
import { Tag } from "../../util/tag";

Model("authentications", {
    unique: ["oauth_sub", "oauth_type"],
    comments: [
        "Authentication Entity of User",
        "combination of `oauth_sub` and `oauth_type` is unique.",
        Tag.namespace(),
        Tag.namespace("User"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    ...Relation.uuid("user", {
        model: "users",
        constraint: "nullable",
    }),
    Field.enum("oauth_type", {
        enum: "OauthType",
        comments: ["one of `github`, `kakao`,"],
    }),
    Field.string("oauth_sub", { comments: ["oauth server user id"] }),
    Field.string("email", {
        constraint: "nullable",
        comments: ["verified email"],
    }),
    DateTime.createdAt(),
    DateTime.updatedAt(),
    DateTime.deletedAt(),
);

Model("users", {
    comments: [
        "Root Entity of User",
        Tag.namespace(),
        Tag.namespace("Article"),
        Tag.namespace("Comment"),
        Tag.namespace("User"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    ...Relation.uuid("membership", {
        model: "memberships",
        constraint: "nullable",
        comments: ["Indicate user permission level"],
    }),
    Field.string("name", { comments: ["displayed name of user"] }),
    Field.string("image_url", {
        constraint: "nullable",
        comments: ["url of user profile image"],
    }),
    DateTime.createdAt(),
    DateTime.updatedAt(),
    DateTime.deletedAt(),
    Field.relation("authentications", { constraint: "list" }),
    Field.relation("articles", { constraint: "list" }),
    Field.relation("comments", { constraint: "list" }),
    Field.relation("attachments", { constraint: "list" }),
);
