module.exports = async ({ config }) => {
  const tsConfig = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
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
