import psg from "@rojiwon123/prisma-schema-generator";

psg.Enum("OauthType")("github", "kakao");

psg.Enum("ArticleBodyFormat")("html", "md", "txt");
