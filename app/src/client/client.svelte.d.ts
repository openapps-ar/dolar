import type { Api } from "../../../../dolar-api/src/api.js";
export type Stored = {
    data: Api["data.json"];
    obtained_at: Date | string;
};
export declare const DATA: {
    readonly $: Stored | null;
    set: (new_v: Stored | null) => void;
    remove: () => void;
};
export declare const is_interval_started: () => boolean;
export declare const start_interval: () => void;
export declare const stop_interval: () => void;
export declare const refresh_if_stale: () => Promise<boolean>;
export declare const refresh: () => Promise<void>;
