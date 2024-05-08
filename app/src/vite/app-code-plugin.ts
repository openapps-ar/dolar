import { Plugin } from "vite"
import { $ } from "zx";
import path from "path";
import fs from "fs";
import crypto from "crypto"

const dist = path.resolve(__dirname, "../../dist");
const dir = path.resolve(__dirname, "../../build");
// const app_js = `${dir}/app.js`;
// const app_css = `${build_dir}/app.css`;
type Entry = { hash: string, js: string }
const entry_code = (entry: Entry) => `export default ${JSON.stringify(entry)};`
// const hash_code = (hash: string) => `export default "${hash}"`


export const appCode = async (): Promise<Plugin> => {
  const mod = '$app-code'

  
  await $`rm -rf ${`${dir}/*`}`;
  await $`npx vite build -c vite.app.config.ts`;
  const js = fs.readFileSync(`${dir}/app.js`, "utf-8");
  const hash = crypto.createHash("md5").update(js).digest("hex");

  fs.writeFileSync(`${dir}/app-hash.txt`, hash);
  fs.writeFileSync(`${dir}/app-entry.js`, entry_code({ hash, js }));
  fs.writeFileSync(`${dir}/app-entry.json`, JSON.stringify({ hash, js }));

  return {
    
    name: 'app-code-plugin', // required, will show up in warnings and errors
    
    resolveId: (id) => {
      if(id !== mod) return;
      return `${dir}/app-entry.js`;
    },

    writeBundle: () => {
      fs.mkdirSync(`${dist}/_app`, { recursive: true });
      fs.writeFileSync(`${dist}/_app/app-hash.txt`, hash);
      fs.writeFileSync(`${dist}/_app/app-entry.js`, entry_code({ hash, js }));
      fs.writeFileSync(`${dist}/_app/app-entry.json`, JSON.stringify({ hash, js }));
    }

    // async load(id) {
    //   if (id === rmod) {
    //     const js = fs.readFileSync(app_js, "utf-8");
    //     // const css = fs.readFileSync(app_css, "utf-8");
    //     const hash = hasher.sha256().update(js).digest("hex");

    //     const entry = { hash, js };

    //     return `export default ${JSON.stringify(entry)}`;
    //   }
    // },
  }
}