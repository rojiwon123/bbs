import { IConnection } from "@nestia/fetcher";

import { get_token } from "./_fragment";

export const test_authorize_successfully = (connection: IConnection) =>
    get_token(connection, "testuser1");
