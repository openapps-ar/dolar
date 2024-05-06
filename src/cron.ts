import { API_DIR } from "./config.js";
import { get_all } from "./fetch.js";
import { render } from "./render.js";

try {
  const data = await get_all();
  await render(API_DIR, data);
  process.exit(0);
} catch(e) {
  console.error(e);
  process.exit(1);
}