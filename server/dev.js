/* eslint-disable node/no-unpublished-import */

import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";

const devMiddlewares = [];

if (process.env.NODE_ENV === "development") {
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

export default {
  devMiddlewares,
};
