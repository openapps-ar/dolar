import path from "path";
import { FullItem, ItemDays, parse_date_string } from "./data.js";
import { Id } from "./config.js";
import fs from "fs/promises";

const timeframes = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "6m": 180,
  "1y": 365,
  "5y": 365 * 5,
  "10y": 365 * 10,
}

export const slice_days = <T extends ItemDays>(src: ItemDays, n: number): T => {
  const { kind, items } = src;
  return { kind, items: items.slice(n) } as T;
}


const $write = async (file: string, data: any) => {
  await fs.writeFile(file, JSON.stringify(data));
}

const $dir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
}

const $rmdir = async (dir: string) => {
  await fs.rmdir(dir, { recursive: true });
}

const p = (v: number | string, n = 2, c = "0") => String(v).padStart(n, c);
const p4 = (v: number | string) => p(v, 4);

export const render = async (
  dir: string,
  data: Record<Id, FullItem>,
  date: Date = new Date(),
  render_days = false,
) => {
  
  await $rmdir(dir);

  await $dir(dir)

  const items = Object.values(data)

  const ids = items.map(item => item.id)

  await $write(`${dir}/ids.json`, { ids })
  await $write(`${dir}/data.json`, { items })
  await $write(`${dir}/meta.json`, { date })
  for(const [key, n] of Object.entries(timeframes)) {
    const filtered = items.map(item => ({ ...item, days: slice_days(item.days, -n) }));
    await $write(`${dir}/${key}.json`, { items: filtered })
  }

  const now = items.map(({ days, ...keep }) => keep);

  await $write(`${dir}/now.json`, { items: now })

  for(const item of items) {
    await render_item(`${dir}/${item.id}`, item, render_days)
  }
} 

export const render_item = async (
  dir: string,
  item: FullItem,
  render_days = false,
) => {
  console.log(item.id);

  await fs.mkdir(dir, { recursive: true })
  
  const { days, ...keep } = item;
  await $write(`${dir}/now.json`, { ...keep });

  await $dir(`${dir}/days`);
  
  for(const [key, n] of Object.entries(timeframes)) {
    await $write(`${dir}/${key}.json`, { days: slice_days(days, -n) })
  }

  const first = days.items[0] ?? null;
  const last = days.items.at(-1) ?? null;

  await $write(`${dir}/days/meta.json`, { first, last });
  console.log({ first, last })

  await $write(`${dir}/days/data.json`, { days });

  const first_y = first ? parse_date_string(first[0]).y : null;
  const last_y = last ? parse_date_string(last[0]).y : null;

  if(first_y != null && last_y != null) {
    for(let y = first_y; y <= last_y; y++) {
      const y_dir = `${dir}/days/${p4(y)}`;
      const year_items = days.items.filter(d => parse_date_string(d[0]).y === y);
      await $dir(y_dir)
      await $write(`${y_dir}/data.json`, { days: { kind: days.kind, items: year_items } });
      
      const first = year_items[0] ?? null;
      const last = year_items.at(-1) ?? null;
      await $write(`${y_dir}/meta.json`, { first, last })

        const first_m = first ? parse_date_string(first[0]).m : 0;
        const last_m = last ? parse_date_string(last[0]).m : 0;

        for(let m = first_m; m <= last_m; m++) {
          const m_dir = `${y_dir}/${p(m)}`;
          const month_items = year_items.filter(d => parse_date_string(d[0]).m === m);
          await $dir(m_dir)
          await $write(`${m_dir}/data.json`, { days: { kind: days.kind, items: month_items } });

          const first = month_items[0] ?? null;
          const last = month_items.at(-1) ?? null;
          await $write(`${m_dir}/meta.json`, { first, last })

          if(render_days) {
            for(const day of month_items) {
            const d = parse_date_string(day[0]).d;
            await $write(`${m_dir}/${p(d)}.json`, { day });
          }
        }
      }
    }
  }
}
