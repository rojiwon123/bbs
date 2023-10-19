/** module 타입 체크용 */
export const assertModule = <T>(module: T): void => {
    module;
};

export const compare =
    (sort: "asc" | "desc") =>
    <T>(map: (input: T) => number) =>
    (a: T, b: T) =>
        sort === "desc" ? map(b) - map(a) : map(a) - map(b);
