import path from "path";
import { FullItem, parse_date_string } from "./data.js";
import { Id } from "./config.js";
import fs from "fs/promises";

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
) => {
  
  await $rmdir(dir);

  await $dir(dir)

  const items = Object.values(data)

  const ids = items.map(item => item.id)

  await $write(`${dir}/ids.json`, { ids })
  await $write(`${dir}/data.json`, { items })
  await $write(`${dir}/meta.json`, { date })

  const now = items.map(({ days, ...keep }) => keep);

  await $write(`${dir}/now.json`, { items: now })

  for(const item of items) {
    await render_item(`${dir}/${item.id}`, item)
  }
} 

export const render_item = async (
  dir: string,
  item: FullItem,
) => {
  console.log(item.id);

  await fs.mkdir(dir, { recursive: true })
  
  const { days, ...keep } = item;
  await $write(`${dir}/now.json`, { ...keep });

  await $dir(`${dir}/days`);
  
  const first = days[0] ?? null;
  const last = days[days.length - 1] ?? null;

  await $write(`${dir}/days/meta.json`, { first, last });
  console.log({ first, last })

  await $write(`${dir}/days/data.json`, { days });

  const first_y = first ? parse_date_string(first[0]).y : null;
  const last_y = last ? parse_date_string(last[0]).y : null;

  if(first_y != null && last_y != null) {
    for(let y = first_y; y <= last_y; y++) {
      const y_dir = `${dir}/days/${p4(y)}`;
      const year_days = days.filter(d => parse_date_string(d[0]).y === y);
      await $dir(y_dir)
      await $write(`${y_dir}/data.json`, { days: year_days });
      
      const first = year_days[0] ?? null;
      const last = year_days[year_days.length - 1] ?? null;
      await $write(`${y_dir}/meta.json`, { first, last })

      const first_m = first ? parse_date_string(first[0]).m : 0;
      const last_m = last ? parse_date_string(last[0]).m : 0;

      for(let m = first_m; m <= last_m; m++) {
        const m_dir = `${y_dir}/${p(m)}`;
        const month_days = year_days.filter(d => parse_date_string(d[0]).m === m);
        await $dir(m_dir)
        await $write(`${m_dir}/data.json`, { days: month_days });

        const first = month_days[0] ?? null;
        const last = month_days[month_days.length - 1] ?? null;
        await $write(`${m_dir}/meta.json`, { first, last })

        for(const day of month_days) {
          const d = parse_date_string(day[0]).d;
          await $write(`${m_dir}/${p(d)}.json`, { day });
        }
      }
    }
  }
}
