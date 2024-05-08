module.exports = {
  apps: {
    mode: "cluster",
    instances: 1,
    script: "./api/dist/node/server.js",
    // args: ["start"],
    interpreter_args: [],
    name: "dolar",
    merge_logs: true,
    time: true,
    // env: { 
    //   FORCE_COLOR: "1",
    //   LOG_TS: "1",
    // },
  }
}