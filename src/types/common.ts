import { Minimum, Type } from "typia/lib/tags";

export interface IPaginatedResponse<T> {
    readonly data: T[];
    readonly page: number & Type<"uint64"> & Minimum<1>;
}

export interface IPage {
    /** @default 1 */
    page?: number & Type<"uint64"> & Minimum<1>;
}
