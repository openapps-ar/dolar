import { type FullItem, type ItemDays, parse_date_string } from "./data.js";
import { type Id } from "./config.js";
import { DaysData, type Api, type TimeframeKey } from "./api.js";
import fs from "fs/promises";

// TODO: use date based filter instead of count
export const timeframes: Record<TimeframeKey, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "6m": 180,
  "1y": 365,
  "5y": 365 * 5,
  "10y": 365 * 10,
  "25y": 365 * 25,
  "all": Number.MAX_VALUE,
}

export const list_timeframes = () => {
  return Object.entries(timeframes) as [TimeframeKey, number][];
}

export const slice_days = <T extends ItemDays>(src: ItemDays, n: number): T => {
  const { kind, items } = src;
  return { kind, items: items.slice(n) } as T;
}

const $write_raw = async (file: string, data: string | Buffer) => {
  await fs.writeFile(file, data);
}

const $write = async <Path extends keyof Api>(dir: string, path: Path, data: Api[Path]) => {
  await $write_raw(`${dir}/${path}`, JSON.stringify(data));
}

const $dir = async (dir: string, path: string) => {
  await fs.mkdir(`${dir}/${path}`, { recursive: true });
}

const $rmdir = async (dir: string, path: string) => {
  try {
    await fs.rm(`${dir}/${path}`, { recursive: true });
  } catch(e: any) {
    if(e.code !== "ENOENT") throw e;
  }
}

export const p = (v: number | string, n = 2, c = "0"): `${number}` => String(v).padStart(n, c) as any;
export const p4 = (v: number | string): `${number}` => p(v, 4);

export const render = async (
  dir: string,
  data: Record<Id, FullItem>,
  date: Date = new Date(),
  render_days = false,
) => {
  
  await $rmdir(dir, "");

  await $dir(dir, "")
  
  // await $write_raw(`${dir}/_headers`, [ 
  //     "access-control-allow-origin: *",
  //     "cache-control: public, max-age=0, must-revalidate",
  //   ].join("\n")
  // );

  const items = Object.values(data)

  const ids = items.map(item => item.id)

  await $write(dir, `ids.json`, { ids })
  await $write(dir, `data.json`, { items })
  await $write(dir, `meta.json`, { date })
  for(const [key, n] of list_timeframes()) {
    const filtered = items.map(item => ({ ...item, days: slice_days(item.days, -n) }));
    await $write(dir, `${key}.json`, { items: filtered })
  }

  const now = items.map(({ days, ...keep }) => keep);

  await $write(dir, `now.json`, { items: now })

  for(const item of items) {
    await render_item(dir, item, render_days)
  }
} 

export const render_item = async (
  dir: string,
  item: FullItem,
  render_days = false,
) => {
  console.log(item.id);

  await $dir(dir, item.id);
  
  const { days, ...keep } = item;
  await $write(dir, `${item.id}/now.json`, { ...keep });

  for(const [key, n] of list_timeframes()) {
    await $write(dir, `${item.id}/${key}.json`, { days: slice_days(days, -n) })
  }

  
  const first = days.items[0] ?? null;
  const last = days.items.at(-1) ?? null;
  
  await $dir(dir, `${item.id}/days`);
  await $write(dir, `${item.id}/days/meta.json`, { first, last });
  await $write(dir, `${item.id}/days/data.json`, { days });

  // const first_y = first ? parse_date_string(first[0]).y : null;
  // const last_y = last ? parse_date_string(last[0]).y : null;

  // if(first_y != null && last_y != null) {
  //   for(let y = first_y; y <= last_y; y++) {
  //     const yyyy = p4(y);
  //     const year_items = days.items.filter(d => parse_date_string(d[0]).y === y) as ItemDays["items"];
  //     await $dir(dir, `${item.id}/days/${yyyy}`);
  //     await $write(dir, `${item.id}/days/${yyyy}/data.json`, { days: { kind: days.kind, items: year_items } } as DaysData);
      
  //     const first = year_items[0] ?? null;
  //     const last = year_items.at(-1) ?? null;
  //     await $write(dir, `${item.id}/days/${yyyy}/meta.json`, { first, last })

  //       const first_m = first ? parse_date_string(first[0]).m : 0;
  //       const last_m = last ? parse_date_string(last[0]).m : 0;

  //       for(let m = first_m; m <= last_m; m++) {
  //         const mm = p(m);
  //         const month_items = year_items.filter(d => parse_date_string(d[0]).m === m) as ItemDays["items"];
  //         await $dir(dir, `${item.id}/days/${yyyy}/${mm}`);
  //         await $write(dir, `${item.id}/days/${yyyy}/${mm}/data.json`, { days: { kind: days.kind, items: month_items } } as DaysData);

  //         const first = month_items[0] ?? null;
  //         const last = month_items.at(-1) ?? null;
  //         await $write(dir, `${item.id}/days/${yyyy}/${mm}/meta.json`, { first, last })

  //         if(render_days) {
  //           for(const day of month_items) {
  //           const dd = p(parse_date_string(day[0]).d);
  //           await $write(dir, `${item.id}/days/${yyyy}/${mm}/${dd}.json`, { day });
  //         }
  //       }
  //     }
  //   }
  // }
}
