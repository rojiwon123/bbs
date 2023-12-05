import psg from "@rojiwon123/prisma-schema-generator";

import { DateTime, Id, Relation } from "../../util/mixin";
import { Tag } from "../../util/tag";

psg.Model("attachments", {
    comments: [
        "Attachment Entity",
        "All the attachment resources managed in the BBS",
        Tag.namespace(),
        Tag.namespace("Article"),
        Tag.author(),
    ],
})(
    Id.uuid(),
    ...Relation.uuid("owner", {
        model: "users",
        comments: ["`attachment` file can only be attached by the owner"],
    }),
    psg.Field.string("name", {
        comments: ["name of attachment resource"],
    }),
    psg.Field.string("extension", {
        comments: ["extension of resource like `md`, `html`, `jpeg`..."],
    }),
    psg.Field.string("url", {
        comments: ["URL path of real resource"],
    }),
    DateTime.createdAt(),
    DateTime.deletedAt(),
    psg.Field.relation("articles", {
        model: "article_attachments",
        constraint: "list",
    }),
);
