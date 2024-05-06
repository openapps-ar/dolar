declare const defaults: {
    color: string;
    class: string;
    opacity: string;
    centered: boolean;
    spreadingDuration: string;
    spreadingDelay: string;
    spreadingTimingFunction: string;
    clearingDuration: string;
    clearingDelay: string;
    clearingTimingFunction: string;
};
export type Options = typeof defaults;
export declare const ripple: (node: HTMLElement, _options?: Partial<Options>) => {
    update(newOptions: any): void;
    destroy: () => void;
};
export {};
