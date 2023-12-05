import type psg from "@rojiwon123/prisma-schema-generator";

const config: psg.IConfiguration = {
    input: "prisma/schemas",
    output: "prisma/schema.prisma",
    datasource: {
        provider: "postgresql",
        url: { env: "DATABASE_URL" },
    },
    generators: [
        {
            name: "db",
            provider: "prisma-client-js",
            output: "../db",
        },
        {
            name: "erd",
            provider: "prisma-markdown",
            output: "../ERD.md",
            title: "BBS",
        },
    ],
};

export default config;
