export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Mutable<T extends object> = {
    -readonly [key in keyof T]: T[key];
};

export type PrismaReturn<T extends (...args: any[]) => any> = NonNullable<
    Awaited<ReturnType<T>>
>;
