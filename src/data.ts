import { tags } from "typia";
import { Id } from "./config.js";

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
export type SourceDataTimePattern =  tags.Pattern<"^[0-9]{2}\\/[0-9]{2}\\/[0-9]{4} - [0-9]{2}:[0-9]{2}$">

export type SourceItem = {
  compra: string
  venta: string
  fecha: string & SourceDataTimePattern,
  variacion: string
  // valor_cierre_ant: string
  "class-variacion": "up" | "down" | "equal"
}

export type SourceItemDayComplex = [ string & SourceDatePattern, string, string ]
export type SourceItemDaySimple = [ string & SourceDatePattern, string ]
export type SourceItemDay = SourceItemDayComplex | SourceItemDaySimple

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

  /** buy */ 
  b: number
  
  /** sell */
  s: number

  /** date */
  d: DateTimeString

  /** variation */
  v: number
  
  /** variation_kind */
  /* up | down | equal */
  k: "u" | "d" | "e" 
  
  /* previous_value */
  // p: number

}

export type FullItem = Item & { days: ItemDay[] }

export type ItemDay = 
  | [ DateString, number, number ]
  | [ DateString, number ];

export const float = (src: string): number => {
  return parseFloat(src.replace(/\./g, "").replace(",", "."))
}

export const datetime = (d: string): DateTimeString => {
  const re = /([0-9]{2})\/([0-9]{2})\/([0-9]{4}) *\- *([0-9]{2})\:([0-9]{2})/
  return d.replace(re, "$3/$2/$1 $4:$5") as DateTimeString
}

export const date = (src: string): DateString => {
  return src.replace(/([0-9]{2})\/([0-9]{2})\/([0-9]{4})/, "$3/$2/$1") as DateString
}

export const map_item_now = (src: SourceItem): Omit<Item, "id"> => {
  return {
    b: float(src.compra),
    s: float(src.venta),
    d: datetime(src.fecha),
    v: float(src.variacion),
    k: src["class-variacion"][0] as "u" | "d" | "e",
    // p: float(src.valor_cierre_ant)
  }
}

export const map_historic_day = (day: SourceItemDayComplex | SourceItemDaySimple): ItemDay => {
  if(day.length === 2) {
    const [d, r] = day
    return [ date(d), float(r) ]
  } else {
    const [d, b, s] = day
    return [ date(d), float(b), float(s) ]
  }
}

export const compare_historic_day = (a: ItemDay, b: ItemDay) => {
  return a[0].localeCompare(b[0])
}