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
    wait_ready: true,
    listen_timeout: 1000 * 60 * 5,
    kill_timeout: 1000 * 60,
    // env: { 
    //   FORCE_COLOR: "1",
    //   LOG_TS: "1",
    // },
  }
}