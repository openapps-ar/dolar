import { mount } from "svelte";
import Notify from "./Notify.svelte";
let instance = null;
export const getNotify = () => {
    if (instance == null) {
        instance = mount(Notify, { target: document.body });
    }
    return instance;
};
export const _error = (text) => {
    getNotify().error(text);
};
export const _message = (text) => {
    getNotify().message(text);
};
export const _warn = (text) => {
    getNotify().warn(text);
};
export const _success = (text) => {
    getNotify().success(text);
};
export const _progress = (text) => {
    const msg = getNotify().progress(text);
    const remove = () => getNotify().remove(msg);
    const resolve = (text) => {
        remove();
        _message(text);
    };
    const reject = (text) => {
        remove();
        _error(text);
    };
    return { remove, resolve, reject };
};
