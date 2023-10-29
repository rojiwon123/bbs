import { IConnection } from "@nestia/fetcher";

import { check_seed_changed, get_token } from "@APP/test/internal/fragment";

export const test_authorize_successfully = (connection: IConnection) =>
    get_token(connection, "user1");

export const test_seed_changed = check_seed_changed;
