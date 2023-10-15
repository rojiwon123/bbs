import { createEnum } from "schemix";

export const OauthType = createEnum("OauthType", (Enum) => {
    Enum.addValue("github").addValue("kakao");
});

export const ArticleBodyFormatType = createEnum(
    "ArticleBodyFormatType",
    (Enum) => {
        Enum.addValue("html").addValue("md").addValue("txt");
    },
);
