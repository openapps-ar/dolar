import type { FullItem, Item, ItemDayAny, ItemDays } from "./data.js"
import type { Id } from "./config.js"

export type TimeframeKey = "1d" | "7d" | "30d" | "90d" | "6m" | "1y" | "5y" | "10y"

export type FullData = { items: FullItem[] }

export type TimeframeAll = { items: FullItem[] }

export type NowAll = { items: Item[] }

export type ISODate = Date | string;

export type DaysMeta = {
  first: ItemDayAny | null,
  last: ItemDayAny | null
}

export type DaysData = {
  days: ItemDays  
}

export type Api = 
  & { [`meta.json`]: { date: ISODate } }
  & { [`ids.json`]: { ids: Id[] } }
  & { [`now.json`]: NowAll }
  & { [`data.json`]: FullData }
  
  & { [K in TimeframeKey as `${K}.json`]: TimeframeAll }
  
  & { [K in Id as `${K}/now.json`]: Item }
  & { [K in Id as `${K}/${TimeframeKey}.json`]: DaysData }
  
  & { [K in Id as `${K}/days/meta.json`]: DaysMeta }
  & { [K in Id as `${K}/days/data.json`]: DaysData }

  & { [K in Id as `${K}/days/${number}/meta.json`]: DaysMeta }
  & { [K in Id as `${K}/days/${number}/data.json`]: DaysData }

  & { [K in Id as `${K}/days/${number}/${number}/meta.json`]: DaysMeta }
  & { [K in Id as `${K}/days/${number}/${number}/data.json`]: DaysData }

  & { [K in Id as `${K}/days/${number}/${number}/${number}.json`]: { day: ItemDayAny } }