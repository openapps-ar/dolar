import { tags } from "typia";
export type Source = {
    _id: string;
    name: string;
    site_url: string;
    dolar_url: string;
    api_list_url: string;
};
export declare const source_ambito: {
    _id: string;
    name: string;
    site_url: string;
    dolar_url: string;
    api_list_url: string;
};
export declare const source_dolarhoy: {
    _id: string;
    name: string;
    site_url: string;
    dolar_url: string;
    api_list_url: string;
};
export declare const sources: Source[];
export type ApiItem = {
    moneda: string;
    casa: string;
    nombre: string;
    compra: number;
    venta: number;
    fechaActualizacion: string & tags.Format<"date-time">;
};
export type Item = {
    source_id: string;
    kind: string;
    name: string;
    buy: number;
    sell: number;
    updated_at: Date;
};
export declare const map_item: (src: ApiItem, source_id: string) => Item;
export declare const list: (source: Source) => Promise<Item[]>;
export declare const list_all: () => Promise<Item[]>;
