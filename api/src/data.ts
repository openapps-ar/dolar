import { tags } from "typia";
import { Id } from "./config.js";
import { assert_never } from "./assert_never.js";

/** YYYY/MM/DD hh:mm */
export type DateTimeString = `${number}/${number}/${number} ${number}:${number}`

export const parse_datetime_string = (src: DateTimeString) => {
  const [y, m, d, h, mm ] = src.split(/[\/: ]/).map(v => parseInt(v));
  return { y, m, d, h, mm }
}

/** YYYY/MM/DD */
export type DateString = `${number}/${number}/${number}`

export const parse_date_string = (src: DateString) => {
  const [y, m, d] = src.split("/").map(v => parseInt(v));
  return { y, m, d }
}

/** DD/MM/YYYY */
export type SourceDatePattern = tags.Pattern<"^[0-9]{2}\\/[0-9]{2}\\/[0-9]{4}$">

/** DD/MM/YYYY - hh:mm */
export type SourceDataTimePattern =  tags.Pattern<"^[0-9]{2}\\/[0-9]{2}\\/[0-9]{4}\\s*\\-?\\s*[0-9]{2}:[0-9]{2}$">

export type SourceItem = {
  compra: string
  venta: string
  valor?: string
  fecha: string & SourceDataTimePattern,
  variacion: string
  valor_cierre_ant?: string
  "class-variacion": "up" | "down" | "equal"
}

export type SourceItemDayComplex = [ string & SourceDatePattern, string, string ]
export type SourceItemDaySimple = [ string & SourceDatePattern, string ]
export type SourceItemDay = SourceItemDayComplex | SourceItemDaySimple

export type DaysKind = "buy" | "sell" | "buy-sell" | "ref"

export type SourceItemDays = 
  | [
      ["Fecha", "Referencia"],  
      ...SourceItemDaySimple[]
    ]
  | [
      ["Fecha", "Compra"],  
      ...SourceItemDaySimple[]
    ]
  | [
      ["Fecha", "Venta"],  
      ...SourceItemDaySimple[]
    ]
  | [
      ["Fecha", "Compra", "Venta"],  
      ...SourceItemDayComplex[]
    ];
  
export type Item = {
  id: Id 

  name: string,

  /** buy */ 
  buy: number
  
  /** sell */
  sell: number

  /** ref */
  ref: number | null

  /** date */
  date: Date

  /** variation */
  variation: number
  
  /** variation_kind */
  /* up | down | equal */
  variation_kind: "up" | "down" | "equal" 
  
  // previous_value
  prev_value: number | null

}

export type FullItem = Item & { days: ItemDays }

export type ItemDaySimple = [ DateString, number ]
export type ItemDayComplex = [ DateString, number, number ]

export type ItemDayAny = ItemDaySimple | ItemDayComplex;

export type ItemDays = 
  | { kind: "buy-sell", items: ItemDayComplex[] }
  | { kind: "buy" | "sell" | "ref", items: ItemDaySimple[] };

export const float = (src: string): number => {
  return parseFloat(src.replace(/\./g, "").replace(",", "."))
}

export const datetime = (d: string): DateTimeString => {
  const re = /([0-9]{2})\/([0-9]{2})\/([0-9]{4})\s*\-?\s*([0-9]{2})\:([0-9]{2})/
  return d.replace(re, "$3/$2/$1 $4:$5") as DateTimeString
}

export const to_date = (src: string): Date => {
  const re = /([0-9]{2})\/([0-9]{2})\/([0-9]{4})\s*\-?\s*([0-9]{2})\:([0-9]{2})/
  const [_, d, m, y, h, mm] = src.match(re) as RegExpMatchArray;
  return new Date(`${y}-${m}-${d}T${h}:${mm}:00-03:00`)
}

export const date = (src: string): DateString => {
  return src.replace(/([0-9]{2})\/([0-9]{2})\/([0-9]{4})/, "$3/$2/$1") as DateString
}

const round = (num: number, decimals: number) => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export const map_item_now = (src: SourceItem): Omit<Item, "id" | "name"> => {
  return {
    buy: float(src.compra),
    sell: float(src.venta),
    ref: src.valor == null ? null : float(src.valor),

    date: to_date(src.fecha),

    // fix javascript rounding errors
    variation: round(float(src.variacion) / 100, 4),
    
    variation_kind: src["class-variacion"],
    prev_value: src.valor_cierre_ant == null ? null : float(src.valor_cierre_ant),
  }
}

export const map_item_days = (src: SourceItemDays): ItemDays => {
  const [ header, ...entries ] = src;
  const kind = map_item_days_kind(header);

  if(kind === "buy-sell") {
    let items: ItemDayComplex[] = entries.map(([d, b, s]) => [ date(d), float(b), float(s!) ] as ItemDayComplex)
      // fix: typo in source
      // see: https://mercados.ambito.com/dolar/mayorista/historico-general/2024-05-01/2024-05-20
      // "8776.5" => "876.5"
      .map(item => {
        if(item[0] === "2024/05/02" && item[1] === 846.5 && item[2] === 8776.5) {
          return [ "2024/05/02", 846.5, 876.5 ] as ItemDayComplex;
        } else {
          return item;
        }
      })
    return { kind, items }
  } else {
    const items: ItemDaySimple[] = entries.map(([d, r]) => [ date(d), float(r) ])
    return { kind, items }
  }
}

export const map_item_days_kind = (header: SourceItemDays[0]): DaysKind => {
  const [_, h1, h2] = header;
  if(h2 != null) return "buy-sell";
  if(h1 === "Compra") return "buy";
  if(h1 === "Venta") return "sell";
  if(h1 === "Referencia") return "ref";
  return assert_never(h1[1], "header kind")
}

export const sort_historic_day = (a: ItemDayAny, b: ItemDayAny) => {
  return a[0].localeCompare(b[0])
}