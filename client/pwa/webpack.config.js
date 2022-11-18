import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import webpack from "webpack";

const dirname = fileURLToPath(new URL(".", import.meta.url));

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

const config = {
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

export default config;
