import { IConnection, IPropagation } from "@nestia/fetcher";

export namespace Util {
    export const addHeaders =
        (headers: Record<string, string>) =>
        (connection: IConnection): IConnection => ({
            ...connection,
            headers: {
                ...connection.headers,
                ...headers,
            },
        });

    export const addToken = (token: string) =>
        addHeaders({ authorization: `bearer ${token}` });

    type Success<
        P extends IPropagation.IBranch<boolean, unknown, any>,
        Status,
    > = P extends IPropagation.IBranch<boolean, Status, any>
        ? P["success"]
        : never;

    type Body<
        P extends IPropagation.IBranch<boolean, unknown, any>,
        Status extends IPropagation.Status,
    > = P extends IPropagation.IBranch<boolean, Status, any>
        ? P["data"]
        : never;

    class AssertResponse extends Error {
        constructor(
            public expected: { success: boolean; status: IPropagation.Status },
            public actual: { success: boolean; status: IPropagation.Status },
        ) {
            super("The API response is not as expected");
            this.name = "AssertResponse";
        }
    }

    export const assertResponse =
        <
            P extends IPropagation.IBranch<boolean, unknown, any>,
            S extends IPropagation.Status,
        >(
            response: Promise<P>,
            expected_status: S,
        ) =>
        async (expected: {
            success: Success<P, S>;
            assertBody: (input: unknown) => Body<P, S>;
            assertHeaders?: <Headers extends Record<string, string | string[]>>(
                input: unknown,
            ) => Headers;
        }): Promise<Body<P, S>> => {
            const { status, success, data, headers } = await response;
            if (expected_status !== status || expected.success !== success) {
                throw new AssertResponse(
                    { success: expected.success, status: expected_status },
                    { success, status },
                );
            }
            if (expected.assertBody) expected.assertBody(data);
            if (expected.assertHeaders) expected.assertHeaders(headers);
            return data;
        };
}
