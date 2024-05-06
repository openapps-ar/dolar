import fetch from "node-fetch";
import { agent } from "./agent.js";
import { HISTORIC_URLS, IDS, Id, NAMES, VARIATION_URLS } from "./config.js";
import { ItemDays, Item, SourceItemDays, SourceItem, sort_historic_day as sort_item_days, map_item_now, FullItem, map_item_days } from "./data.js";
import { assert } from "typia";

const default_from = () => new Date(2000, 0, 1);

const item_now_url = (id: Id) => {
  return VARIATION_URLS[id];
}

const p = (v: number | string, n = 2, c = "0") => String(v).padStart(n, c);

const datestr = (date: Date) => `${p(date.getDate())}-${p(date.getMonth() + 1)}-${p(date.getFullYear(), 4)}`

const item_days_url = (id: Id, from = default_from(), _to = new Date) => {
  const to = new Date(+_to + 24 * 60 * 60 * 1000);
  return `${HISTORIC_URLS[id]}/${datestr(from)}/${datestr(to)}`;
}

export const get_json = async <T = unknown>(url: string): Promise<T> => {
  console.log("get_json", url);
  const res = await fetch(url, { agent });
  if(!res.ok) throw new Error(`Failed to fetch ${url}: status not OK, ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json as T;
}

export const get_source_item_now = async (id: Id): Promise<SourceItem> => {
  const url = item_now_url(id);
  const raw = await get_json(url);
  const data = assert<SourceItem>(raw);
  return data; 
}

export const get_item_now = async (id: Id): Promise<Item> => {
  const source = await get_source_item_now(id);
  return { id, name: NAMES[id], ...map_item_now(source) };
}

export const get_source_item_days = async (id: Id, from = default_from(), to = new Date): Promise<SourceItemDays> => {
  const url = item_days_url(id, from, to);
  const raw = await get_json(url);
  const data = assert<SourceItemDays>(raw);
  return data;
}

export const get_item_days = async (id: Id, from = default_from(), to = new Date): Promise<ItemDays> => {
  const source = await get_source_item_days(id, from, to);
  const mapped = map_item_days(source);
  mapped.items.sort(sort_item_days);
  return mapped;
}

export const get_full_item = async (id: Id, from = default_from(), to = new Date): Promise<FullItem> => {
  const [item, days] = await Promise.all([
    get_item_now(id),
    get_item_days(id, from, to)
  ])

  return { ...item, days }
}

export const get_all = async (from = default_from(), to = new Date): Promise<Record<Id, FullItem>> => {
  const items = await Promise.all(IDS.map(id => get_full_item(id, from, to)));
  const data: Record<Id, FullItem> = Object.create(null);
  for(const item of items) {
    data[item.id] = item;
  }

  return data
}