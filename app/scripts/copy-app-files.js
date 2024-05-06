cd(path.resolve(__dirname, "../.."))

await $`mkdir -p ./generated/pages/_app/v1`

for(const name of ["app-entry.js", "app-entry.json", "app-hash.txt", "app.js"]) {
  await $`cp ${`./app/build/${name}`} ${`./generated/pages/_app/v1/${name}`}`;
}
