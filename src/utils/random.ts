import { randomInt, randomUUID } from "crypto";
import typia from "typia";

export namespace Random {
    export const uuid = (): string & typia.tags.Format<"uuid"> => randomUUID();
    export const int = ({
        min = 0,
        max,
    }: {
        min?: number;
        max: number;
    }): number & typia.tags.Type<"int64"> => randomInt(min, max);
    export const decimal = (
        max: number,
    ): number & typia.tags.Type<"double"> & typia.tags.Minimum<0> =>
        Math.random() * max;
    export const string = (length: number) => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        return Array.from({ length }, () =>
            chars.charAt(int({ max: chars.length })),
        ).join("");
    };

    export const iso = typia.createRandom<
        string & typia.tags.Format<"date-time">
    >();
}
