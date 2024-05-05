import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { get_all } from "./fetch.js";
import { render } from "./render.js";
import { DATA_DIR } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = await get_all();

const file = path.join(__dirname, "data-5y.json");

await render(DATA_DIR, data);

process.exit();