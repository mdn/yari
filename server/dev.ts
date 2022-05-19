const devMiddlewares = [];

if (process.env.NODE_ENV === "development") {
  /* eslint-disable node/no-unpublished-require */
  const webpack = require("webpack");
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");

  const webpackConfig = {
    entry: {
      app: [
        "react-hot-loader/patch",
        "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000",
        "./index.js",
      ],
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  };

  const compiler = webpack(webpackConfig);

  devMiddlewares.push(
    webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: webpackConfig.output.publicPath,
    })
  );

  devMiddlewares.push(
    webpackHotMiddleware(compiler, {
      path: "/__webpack_hmr",
      heartbeat: 10000,
    })
  );
}

module.exports = {
  devMiddlewares,
};
