import { createEnum } from "schemix";

export const OauthType = createEnum("OauthType", (Enum) => {
    Enum.addValue("github").addValue("kakao");
});

export const ArticleBodyFormat = createEnum("ArticleBodyFormat", (Enum) => {
    Enum.addValue("html").addValue("md").addValue("txt");
});
