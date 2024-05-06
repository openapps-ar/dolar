type MaybeFn<T> = T | (() => T);
export declare const storage_var: <T>(k: string, { initial, parse, stringify, auto_initialize, }: {
    initial: MaybeFn<T>;
    parse: (v: string) => T;
    stringify: (v: T) => string;
    auto_initialize?: boolean | undefined;
}) => {
    readonly $: T;
    set: (new_v: T) => void;
    remove: () => void;
};
export declare const bool: (key: string, initial?: MaybeFn<boolean>, auto_initialize?: boolean) => {
    readonly $: boolean;
    set: (new_v: boolean) => void;
    remove: () => void;
};
export declare const nullable_date: (key: string, initial?: MaybeFn<Date | null>, auto_initialize?: boolean) => {
    readonly $: Date | null;
    set: (new_v: Date | null) => void;
    remove: () => void;
};
export declare const num: (key: string, initial?: number, auto_initialize?: boolean) => {
    increment: (d?: number) => void;
    decrement: (d?: number) => void;
    remove: () => void;
    $: number;
    set: (new_v: number) => void;
};
export declare const COLOR_SCHEME: {
    readonly $: "light" | "dark" | null;
    set: (new_v: "light" | "dark" | null) => void;
    remove: () => void;
};
export declare const ORDERS: {
    readonly $: Record<string, string | undefined>;
    set: (new_v: Record<string, string | undefined>) => void;
    remove: () => void;
};
export {};
