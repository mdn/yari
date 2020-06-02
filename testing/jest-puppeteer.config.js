const serverExports = {};
if (JSON.parse(process.env.TESTING_START_SERVER || "false")) {
  serverExports.server = {
    command: "node ../server/index.js",
    port: 5000,
    host: "localhost",
    debug: true, // XXX Note sure that the harm is of having this on
  };
}

module.exports = {
  ...serverExports,
  launch: {
    headless: !JSON.parse(process.env.TESTING_OPEN_BROWSER || "false"),
  },
};
