import type { WebpackConfiguration } from "webpack-dev-server";

export const devMiddlewares = [];

const NODE_ENV = process.env.NODE_ENV || "development";
if (NODE_ENV === "development") {
  const [webpack, webpackDevMiddleware, webpackHotMiddleware] = (
    await Promise.all([
      import("webpack"),
      import("webpack-dev-middleware"),
      import("webpack-hot-middleware"),
    ])
  ).map((p) => p.default);

  const webpackConfig: WebpackConfiguration = {
    entry: {
      app: ["webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000"],
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  };

  const compiler = webpack(webpackConfig);

  devMiddlewares.push(webpackDevMiddleware(compiler));

  devMiddlewares.push(
    webpackHotMiddleware(compiler, {
      path: "/__webpack_hmr",
      heartbeat: 10000,
    })
  );
}
