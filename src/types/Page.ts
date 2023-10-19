import typia from "typia";

export namespace IPage {
    export type SortType = "asc" | "desc";
    export interface IResponse<T> {
        data: T[];
        skip: number & typia.tags.Type<"uint64">;
        limit: number & typia.tags.Type<"uint64"> & typia.tags.Minimum<10>;
    }

    export interface ISearch {
        /** @default 0 */
        skip?: number & typia.tags.Type<"uint64">;
        /** @default 10 */
        limit?: number & typia.tags.Type<"uint64"> & typia.tags.Minimum<10>;
    }
}
