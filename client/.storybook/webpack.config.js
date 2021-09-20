module.exports = async ({ config }) => {
  const tsConfig = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: "@linaria/webpack-loader",
        options: {
          sourceMap: process.env.NODE_ENV !== "production",
          cacheDirectory: "./src/stories/.linaria_cache",
        },
      },
      {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
    ],
  };

  config.module.rules.push(tsConfig);
  return config;
};
