const path = require("path");

const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  context: path.resolve(__dirname, "."),
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    sourceMapFilename: "[name].js.map",
    libraryTarget: "commonjs2",
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    modules: ["node_modules", "src"],
    extensions: ["*", ".js", ".json", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgo: false,
              titleProp: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ["file-loader?outputPath=/dev/null"],
      },
      { test: /\.(png|jpe?g|gif)$/, loader: "ignore-loader" },
      { test: /\.(css|scss)$/, loader: "ignore-loader" },
    ],
  },
  externals: nodeExternals(),
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};
