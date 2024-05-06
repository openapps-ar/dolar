import { $ } from "zx";
import path from "path";
import etag from "etag";
import fs from "fs";
const dist = path.resolve(__dirname, "../../dist");
const dir = path.resolve(__dirname, "../../build");
const entry_code = (entry) => `export default ${JSON.stringify(entry)};`;
// const hash_code = (hash: string) => `export default "${hash}"`
export const appCode = async () => {
    const mod = '$app-code';
    const rmod = '\0' + mod;
    await $ `npx vite build -c vite.app.config.ts`;
    const js = fs.readFileSync(`${dir}/app.js`, "utf-8");
    const hash = etag(js).replaceAll('"', '');
    fs.writeFileSync(`${dir}/app-hash.txt`, hash);
    fs.writeFileSync(`${dir}/app-entry.js`, entry_code({ hash, js }));
    fs.writeFileSync(`${dir}/app-entry.json`, JSON.stringify({ hash, js }));
    return {
        name: 'app-code-plugin', // required, will show up in warnings and errors
        resolveId: (id) => {
            if (id !== mod)
                return;
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
    };
};
