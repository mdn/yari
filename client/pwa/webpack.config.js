const path = require("path");
const commitHash = require("child_process")
  .execSync("git rev-parse --short HEAD")
  .toString()
  .trim();
const webpack = require("webpack");

const dirname = __dirname;

module.exports = {
  entry: {
    bundle: path.join(dirname, "./src/service-worker.ts"),
  },

  output: {
    filename: "service-worker.js",
    path: path.join(dirname, "../public/"),
  },

  mode: "development",
  devtool: "inline-source-map",

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
  //  plugins: [new webpack.optimize.ModuleConcatenationPlugin()],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: "ts-loader",
      },
    ],
  },
};
