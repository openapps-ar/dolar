export type Item = {
    _id: string;
    name: string;
    buy?: number;
    sell?: number;
    decimals: number;
    updated_at: Date | string;
};
export declare const items: ({
    _id: string;
    name: string;
    buy: number;
    sell: number;
    decimals: number;
    updated_at: Date;
} | {
    _id: string;
    name: string;
    sell: number;
    decimals: number;
    updated_at: Date;
    buy?: undefined;
})[];
