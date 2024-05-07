module.exports = {
  apps: {
    mode: "fork",
    instances: 1,
    script: "./api/dist/node/server.js",
    // args: ["start"],
    interpreter_args: [],
    name: "opendeploy",
    time: true,
    // env: { 
    //   FORCE_COLOR: "1",
    //   LOG_TS: "1",
    // },
  }
}