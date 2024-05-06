export type Runtime = {
    code_storage_key: string;
    current_code_origin?: "network" | "storage" | "apk" | null;
    current_app?: any;
    current_hash?: string | null;
    destroyers: (() => void)[];
};
export declare const run: Runtime;
