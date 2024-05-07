import { get_all } from "../fetch.js";
import { create_api } from "./api.js";
import mkEtag from "etag"

const INTERVAL_MS = 1000 * 60 * 2;

const start_interval = async () => {
  while(true) {
    await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
    try {
      data = await get_all();
      set_data(data);
      console.log("data updated");
    } catch(e) {
      console.warn("error getting data", String(e));
    }
  }
}

export type Data = typeof data;

let data = await get_all();
let api = create_api(data);
let etag = mkEtag(JSON.stringify(api))

const set_data = (_data: typeof data) => {
  data = _data;
  api = create_api(data);
  etag = mkEtag(JSON.stringify(api))
}

export const get_data = () => data;
export const get_api = () => ({ etag, api });


start_interval()
