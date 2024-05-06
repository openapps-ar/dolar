export declare const run_all: (fns: (() => void)[]) => void;
export declare const add: <E extends Event = Event>(target: EventTarget, event: string, fn: (event: E) => void, options?: AddEventListenerOptions) => () => void;
export declare const intersect: (node: Element, { enter, leave, options }: {
    enter: () => void;
    leave: () => void;
    options?: IntersectionObserverInit | undefined;
}) => {
    destroy: () => void;
};
export declare const click_out: (node: Node, handler: (event: MouseEvent) => void) => {
    destroy: () => void;
};
export declare const portal: (node: HTMLElement) => {
    destroy(): void;
};
export declare const intelliHide: (node: HTMLElement) => {
    destroy: () => void;
};
