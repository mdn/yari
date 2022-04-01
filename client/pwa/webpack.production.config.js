const path = require("path");
const commitHash = require("child_process")
  .execSync("git rev-parse --short HEAD")
  .toString()
  .trim();
const webpack = require("webpack");

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

  plugins: [
    new webpack.DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(commitHash),
    }),
  ],

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
