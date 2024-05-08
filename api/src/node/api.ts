import { Api, DaysData } from "../api.js";
import { FullItem, ItemDays, parse_date_string } from "../data.js";
import { list_timeframes, p, p4, slice_days } from "../render.js";
import type { Data } from "./data.js";

export const create_api = (data: Data, { render_days = false } = {}): Api => {
  const start = performance.now();
  
  // @ts-ignore
  const api: Api = Object.create(null);
  
  const date = new Date()


  const items = Object.values(data)

  const ids = items.map(item => item.id)

  api[`ids.json`] = { ids };
  api[`data.json`] = { items };
  api[`meta.json`] = { date };

  for(const [key, n] of list_timeframes()) {
    const filtered = items.map(item => ({ ...item, days: slice_days(item.days, -n) }));
    api[`${key}.json`] = { items: filtered };
  }

  const now = items.map(({ days, ...keep }) => keep);

  api[`now.json`] = { items: now };


  for(const item of items) {
    render_item(api, item, render_days)
  }
  
  const end = performance.now();
  console.log(`created api in ${(end - start).toFixed(2)}ms`);

  return api;
}

export const render_item = async (
  api: Api,
  item: FullItem,
  render_days = false,
) => {
  const { days, ...keep } = item;
  api[`${item.id}/now.json`] = { ...keep };

  for(const [key, n] of list_timeframes()) {
    api[`${item.id}/${key}.json`] = { days: slice_days(days, -n) };
  }

  const first = days.items[0] ?? null;
  const last = days.items.at(-1) ?? null;
  
  api[`${item.id}/days/meta.json`] = { first, last };
  api[`${item.id}/days/data.json`] = { days };

  const first_y = first ? parse_date_string(first[0]).y : null;
  const last_y = last ? parse_date_string(last[0]).y : null;

  if(first_y != null && last_y != null) {
    for(let y = first_y; y <= last_y; y++) {
      const yyyy = p4(y);
      const year_items = days.items.filter(d => parse_date_string(d[0]).y === y) as ItemDays["items"];
      api[`${item.id}/days/${yyyy}/data.json`] = { days: { kind: days.kind, items: year_items } } as DaysData;
      
      const first = year_items[0] ?? null;
      const last = year_items.at(-1) ?? null;
      api[`${item.id}/days/${yyyy}/meta.json`] = { first, last };

        const first_m = first ? parse_date_string(first[0]).m : 0;
        const last_m = last ? parse_date_string(last[0]).m : 0;

        for(let m = first_m; m <= last_m; m++) {
          const mm = p(m);
          const month_items = year_items.filter(d => parse_date_string(d[0]).m === m) as ItemDays["items"];
          api[`${item.id}/days/${yyyy}/${mm}/data.json`] = { days: { kind: days.kind, items: month_items } } as DaysData;

          const first = month_items[0] ?? null;
          const last = month_items.at(-1) ?? null;
          api[`${item.id}/days/${yyyy}/${mm}/meta.json`] = { first, last };

          if(render_days) {
            for(const day of month_items) {
            const dd = p(parse_date_string(day[0]).d);
            api[`${item.id}/days/${yyyy}/${mm}/${dd}.json`] = { day };
          }
        }
      }
    }
  }
}
