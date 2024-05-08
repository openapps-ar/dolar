import { get_all } from "../fetch.js";
import { create_api } from "./api.js";
import { make_cache } from "./cache.js";

const INTERVAL_MS = 1000 * 60 * 1;

const start_interval = async () => {
  while(true) {
    await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
    try {
      data = await get_all();
      set_data(data);
    } catch(e) {
      console.warn("error getting data", String(e));
    }
  }
}

export type Data = typeof data;

let data = await get_all();
let api = create_api(data);
let cache = make_cache(api);

const set_data = (_data: typeof data) => {
  const start = performance.now();
  data = _data;
  api = create_api(data);
  cache = make_cache(api);
  const end = performance.now();
  console.log(`updated data in ${(end - start).toFixed(2)}ms`);
}

export const get_data = () => data;
export const get_api = () => api;
export const get_cache = () => cache;


start_interval()
