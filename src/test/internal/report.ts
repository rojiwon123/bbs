import { isUndefined } from "@fxts/core";
import { DynamicExecutor } from "@nestia/e2e";
import fs from "fs";
import path from "path";
import stripAnsi from "strip-ansi";
import { inspect } from "util";

export namespace Report {
    type Color =
        | "Gray"
        | "Blue"
        | "SkyBlue"
        | "Cyan"
        | "Green"
        | "LightGreen"
        | "Purple"
        | "Red"
        | "LightRed"
        | "Yellow"
        | "White";

    const ansiMapper: Record<Color, number> = {
        Gray: 90,
        Blue: 34,
        SkyBlue: 94,
        Cyan: 36,
        Green: 32,
        LightGreen: 92,
        Purple: 35,
        Red: 31,
        LightRed: 91,
        Yellow: 33,
        White: 0,
    };

    export const color = (style: Color) => (text: string | number | boolean) =>
        `\x1b[${ansiMapper[style]}m${text}\x1b[0m`;

    // 테스트 통계 결과
    type IAnalyze = Passed | Failed;
    interface Passed {
        result: 0;
        count: number;
        time: number;
        passed: { name: string; cases: { name: string; time: number }[] }[];
    }
    interface Failed {
        result: -1;
        total_count: number;
        failed_count: number;
        failed: { name: string; cases: { name: string; error: Error }[] }[];
    }
    export const analyze = (report: DynamicExecutor.IReport): IAnalyze => {
        const executions = report.executions.filter(
            <T extends { error: Error | null }>(
                exe: T,
            ): exe is T & { error: Error } => exe.error !== null,
        );

        const getGroupName = (location: string) =>
            location
                .replace(report.location + "/", "")
                .replace(/\.(js|ts)$/, "")
                .replaceAll("/", " > ");

        if (executions.length === 0) {
            const passed: Passed["passed"] = [];
            report.executions.forEach((exe) => {
                const group_name = getGroupName(exe.location);
                const group = passed.find((group) => group.name === group_name);
                if (isUndefined(group))
                    passed.push({
                        name: group_name,
                        cases: [
                            {
                                name: exe.name,
                                time: exe.time,
                            },
                        ],
                    });
                else group.cases.push({ name: exe.name, time: exe.time });
            });
            return {
                result: 0,
                count: report.executions.length,
                time: report.time,
                passed,
            };
        }

        const failed: Failed["failed"] = [];
        executions.forEach((exe) => {
            const group_name = getGroupName(exe.location);
            const group = failed.find((group) => group.name === group_name);
            if (isUndefined(group))
                failed.push({
                    name: group_name,
                    cases: [
                        {
                            name: exe.name,
                            error: exe.error,
                        },
                    ],
                });
            else group.cases.push({ name: exe.name, error: exe.error });
        });

        return {
            result: -1,
            total_count: report.executions.length,
            failed_count: failed.length,
            failed,
        };
    };

    const _write =
        (stream: fs.WriteStream) =>
        (chunk: unknown = "") => {
            if (chunk == undefined) {
                stream.write("\n");
            } else if (typeof chunk === "object") {
                stream.write("```bash\n");
                stream.write(stripAnsi(inspect(chunk, { compact: false })));
                stream.write("\n```\n");
            } else if (typeof chunk === "string") {
                stream.write(stripAnsi(chunk) + "\n");
            } else {
                stream.write(`${chunk}` + "\n");
            }
            return stream;
        };

    export const log = (result: IAnalyze): void => {
        const report_path = path.resolve(process.cwd(), "./test_log.md");
        const stream = fs.createWriteStream(report_path, { flags: "w" });
        const write = _write(stream);
        if (result.result === 0) {
            write("# Test Report ✅");
            write();
            write("## Summary");
            write();
            write("| State | Count |");
            write("| :---: | :---: |");
            write(`| Total | ${result.count} |`);
            write(`| Elapsed Time | ${result.time} ms |`);
            write();
            write("## Detail");
            write();
            result.passed.forEach((group) => {
                write("<details>");
                write(`<summary>${group.name}</summary>`);
                write();
                group.cases.forEach((exe) => {
                    write(`-   ${exe.name}: ${exe.time} ms`);
                });
                write();
                write("</details>");
            });
        } else {
            write("# Test Report ❌");
            write();
            write("## Summary");
            write();
            write("| State | Count |");
            write("| :---: | :---: |");
            write(`| Failed | ${result.failed_count} |`);
            write(`| Total | ${result.total_count} |`);
            write();
            write("## Detail");
            write();
            result.failed.forEach((group) => {
                write("<details>");
                write(`<summary>${group.name}</summary>`);
                group.cases.forEach((exe) => {
                    write();
                    write(`-   ${exe.name}`);
                    write();
                    write(exe.error);
                });
                write();
                write("</details>");
            });
        }

        stream.end();
    };
}