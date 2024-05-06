export type Mods = typeof import("./apk-mods").__MODS__;
declare global {
    interface Window {
        __MODS__: Mods;
    }
}
