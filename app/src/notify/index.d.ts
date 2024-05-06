import Notify from "./Notify.svelte";
export declare const getNotify: () => Notify;
export declare const _error: (text: Text) => void;
export declare const _message: (text: Text) => void;
export declare const _warn: (text: Text) => void;
export declare const _success: (text: Text) => void;
export declare const _progress: (text: Text) => {
    remove: () => any;
    resolve: (text: Text) => void;
    reject: (text: Text) => void;
};
