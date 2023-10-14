import type nestia from "@nestia/sdk";

const NESTIA_CONFIG: nestia.INestiaConfig = {
    input: "src/controllers",
    output: "./sdk",
    simulate: true,
    propagate: true,
    clone: true,
    primitive: true,
    json: false,
    swagger: {
        decompose: true,
        output: "packages/api/swagger/swagger.json",
        info: {
            title: "BBS Server",
            description: "RESTFul API Server for Bulletin Board System",
            version: "0.0.1",
        },
        servers: [
            { url: "https://localhost:4000", description: "Local Server" },
        ],
        security: {
            access: {
                type: "apiKey",
                name: "Authorization",
                in: "header",
            },
            refresh: {
                type: "apiKey",
                name: "Authorization",
                in: "header",
            },
        },
    },
};

export default NESTIA_CONFIG;
