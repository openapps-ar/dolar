import { get_all } from "./fetch.js";
import { render } from "./render.js";
import { API_DIR } from "./config.js";

const data = await get_all();
await render(API_DIR, data);

process.exit();