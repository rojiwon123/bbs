import { IConnection } from "@nestia/fetcher";
import assert from "assert";

import { Backend } from "@APP/application";
import { Configuration } from "@APP/infrastructure/config";

import { Mocker } from "./internal/mocker";
import { Seed } from "./internal/seed";
import { runTest } from "./runner";

void (async () => {
    Mocker.init();
    await Seed.init();
    const seed_snapshot_before = await Seed.count();
    const app = await Backend.start({ logger: false });
    const connection: IConnection = {
        host: `http://localhost:${Configuration.PORT}`,
    };

    const state = await runTest(connection);

    await Backend.end(app);
    const seed_snapshot_after = await Seed.count();
    await Seed.restore();
    assert.deepStrictEqual(
        seed_snapshot_before,
        seed_snapshot_after,
        "seed size is changed",
    );
    process.exit(state);
})();
