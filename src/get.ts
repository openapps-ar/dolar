import { get_all } from "./fetch.js";
import { render } from "./render.js";
import { DATA_DIR } from "./config.js";

const data = await get_all();
await render(DATA_DIR, data);

process.exit();