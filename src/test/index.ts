import { IConnection } from "@nestia/fetcher";

import { Backend } from "@APP/application";
import { Configuration } from "@APP/infrastructure/config";

import { Mock } from "./internal/mock";
import { Seed } from "./internal/seed";
import { runTest } from "./runner";

Mock.run();

void (async () => {
    const app = await Backend.start({ logger: false });
    const connection: IConnection = {
        host: `http://localhost:${Configuration.PORT}`,
    };
    await Seed.run();

    const state = await runTest(connection);

    await Backend.end(app);
    await Seed.truncate();
    process.exit(state);
})();
