import { IConnection, IPropagation } from "@nestia/fetcher";
import fs from "fs";
import stripAnsi from "strip-ansi";

export namespace Util {
    export namespace md {
        export const header =
            (level: 1 | 2 | 3 | 4 | 5 | 6 = 1) =>
            (title: string) =>
                console.log("#".repeat(level), title);

        let toggleOpend: boolean = false;
        export const toggleOpen = (summary: string) => {
            if (toggleOpend) {
                console.log("</details>");
                console.log("<details>");
                console.log(`<summary>${summary}</summary>`);
            } else {
                console.log("<details>");
                console.log(`<summary>${summary}</summary>`);
            }
            toggleOpend = true;
        };

        export const toggleClose = () => {
            if (toggleOpend) console.log("</details>");
            toggleOpend = false;
        };

        export const bash = (text: string) => {
            console.log("```bash\n" + text + "\n```");
        };

        export const title = (filename: string) =>
            toggleOpen(
                `\x1b[33m${filename.split("/").at(-1)!.slice(0, -3)}\x1b[0m`,
            );
    }

    export const log =
        (run: () => Promise<boolean>) =>
        async (dirname: string): Promise<boolean> => {
            const queue: string[] = [];
            const write = process.stdout.write;
            process.stdout.write = (str: string) => {
                queue.push(str);
                return true;
            };
            try {
                return await run();
            } catch (err) {
                console.log(err);
                return false;
            } finally {
                process.stdout.write = write;
                const stream = fs.createWriteStream(dirname, { flags: "w" });
                const md = queue
                    .map((line) => line.trimStart())
                    .map((line) =>
                        line.includes("</summary>") || line.startsWith("#")
                            ? line + "\n"
                            : line.includes("```bash") ||
                              line.includes("Test Count") ||
                              line.includes("❌")
                            ? "\n" + line + "\n"
                            : line.includes("</details>") || line.includes("✅")
                            ? "\n" + line
                            : line.startsWith("-")
                            ? "  " + line
                            : line,
                    )
                    .join("")
                    .replaceAll("\n\n\n", "\n\n")
                    .replaceAll(
                        "</details>\n\n<details>",
                        "</details>\n<details>",
                    );

                stream.write(stripAnsi(md));
                process.stdout.write(
                    md
                        .replaceAll("<details>\n", "")
                        .replaceAll("</details>\n", "")
                        .replaceAll("<summary>", "")
                        .replaceAll("</summary>", "")
                        .replaceAll("```bash\n", "")
                        .replaceAll("```\n", "")
                        .replaceAll("\n\n\n", "\n\n"),
                );
                stream.end();
            }
        };

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
            const result = await response;
            if (
                expected_status !== result.status ||
                expected.success !== result.success
            ) {
                const error = new Error(
                    `The API response does not match the expected result\nExpected: status: ${expected_status} success: ${expected.success}\nActual: status: ${result.status} success: ${result.success}`,
                );
                error.name = "AssertResponse";
                throw error;
            }
            if (expected.assertBody) expected.assertBody(result.data);
            if (expected.assertHeaders) expected.assertHeaders(result.headers);
            return result.data;
        };
}
