import type { WebpackConfiguration } from "webpack-dev-server";

export const devMiddlewares = [];

if (process.env.NODE_ENV === "development") {
  const [webpack, webpackDevMiddleware, webpackHotMiddleware] = (
    await Promise.all([
      import("webpack"),
      import("webpack-dev-middleware"),
      import("webpack-hot-middleware"),
    ])
  ).map((p) => p.default);

  const webpackConfig: WebpackConfiguration = {
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
