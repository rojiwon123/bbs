import psg from "@rojiwon123/prisma-schema-generator";

import { DateTime, Id, Relation } from "../../util/mixin";
import { Tag } from "../../util/tag";

psg.Model("comments", {
    index: ["created_at"],
    comments: [
        "Root Entity of Comment",
        "a user can comment short text on article or other comment",
        Tag.namespace(),
        Tag.namespace("Comment"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    ...Relation.uuid("author", { model: "users" }),
    ...Relation.uuid("article", { model: "articles" }),
    ...Relation.uuid("parent", {
        name: "HierarchicalComment",
        model: "comments",
        constraint: "nullable",
        comments: ["a parent comment id in a hierarchical structure"],
    }),
    DateTime.createdAt(),
    DateTime.deletedAt(),
    psg.Field.relation("snapshots", {
        model: "comment_snapshots",
        constraint: "list",
    }),
    psg.Field.relation("children", {
        name: "HierarchicalComment",
        model: "comments",
        constraint: "list",
    }),
);

psg.Model("comment_snapshots", {
    comments: [
        "Snapshot of Comment",
        "an `comment_snapshots` record contains the content of an comment's specific version.",
        "When a user edit an comment, a new snapshot record is created, and readers will view the snapshot record linked to the most recently created version among the connected records.",
        Tag.namespace(),
        Tag.namespace("Comment"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    ...Relation.uuid("comment", { model: "comments" }),
    psg.Field.string("body"),
    DateTime.createdAt(),
);
