import "zx/globals";

/** 
 * @param {string} key 
 * @param {string | null | undefined} def
 * */
const env = (key, def = null) => {
  const v = process.env[key];
  if(v == null) {
    if(def == null) throw new Error(`missing env var ${key}`);
    else return def;
  }
  return v;
}

await within(async () => {
  
  cd("app")
  

  await $`npm run build`;
  // await $`npm run assets`;
  await $`npx cap sync android`;

  const args = [
    "--androidreleasetype", "APK",
    "--keystorepath", env("DOLAR_KEYSTORE_PATH"),
    "--keystorepass", env("DOLAR_KEYSTORE_PASS"), 
    "--keystorealias", env("DOLAR_KEYSTORE_ALIAS"),
    "--keystorealiaspass", env("DOLAR_KEYSTORE_ALIAS_PASS")
  ];

  await $`npx cap build android ${args}`
})

await $`mkdir -p apk`;
await $`cp -v app/android/app/build/outputs/apk/release/app-release-signed.apk apk/dolar.apk`