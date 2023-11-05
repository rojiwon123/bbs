import { randomInt, randomUUID } from "crypto";
import typia from "typia";

export namespace Random {
    export const uuid = (): string & typia.tags.Format<"uuid"> => randomUUID();
    /** `min <= n <= max` */
    export const int = ({
        min = 0,
        max,
    }: {
        min?: number;
        max: number;
    }): number & typia.tags.Type<"int64"> => randomInt(min, max + 1);

    /** `0 <= n < max` */
    export const double = (max: number): number & typia.tags.Type<"double"> =>
        Math.random() * max;

    export const string = (length: number) => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        return Array.from({ length }, () =>
            chars.charAt(int({ max: chars.length - 1 })),
        ).join("");
    };

    export const iso = typia.createRandom<
        string & typia.tags.Format<"date-time">
    >();
}
