import type nestia from "@nestia/sdk";

const NESTIA_CONFIG: nestia.INestiaConfig = {
    input: "src/controller",
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
            description: "API DOC For Bulletin Board System API Server",
        },
        servers: [
            { url: "http://localhost:4000", description: "Local Server" },
        ],
        security: {
            bearer: {
                type: "http",
                scheme: "bearer",
            },
        },
    },
};

export default NESTIA_CONFIG;
