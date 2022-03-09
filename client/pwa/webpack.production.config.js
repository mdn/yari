const path = require("path");

module.exports = {
  entry: {
    bundle: path.join(__dirname, "./src/service-worker.ts"),
  },

  output: {
    filename: "service-worker.js",
    path: path.join(__dirname, "../public/"),
  },

  mode: "production",

  watchOptions: {
    ignored: /node_modules|dist|\.js/g,
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    plugins: [],
  },

  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: "ts-loader",
      },
    ],
  },
};
