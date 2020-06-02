module.exports = {
  launch: {
    headless: !JSON.parse(process.env.TESTING_OPEN_BROWSER || "false"),
  },
};
