import { createEnum } from "schemix";

export const ArticleBodyFormatType = createEnum(
    "ArticleBodyFormatType",
    (Enum) => {
        Enum.addValue("html").addValue("md").addValue("txt");
    },
);
