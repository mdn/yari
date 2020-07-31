const path = require("path");

module.exports = {
  addons: [
    "@storybook/addon-viewport",
    "@storybook/preset-typescript",
    "@storybook/addon-a11y/register",
    "@storybook/addon-knobs/register",
    {
      name: "@storybook/addon-docs",
      options: {
        configureJSX: true,
      },
    },
  ],
  webpackFinal: async (config, { configType }) => {
    // remove svg from existing rule
    config.module.rules = config.module.rules.map((rule) => {
      if (
        String(rule.test) ===
        String(
          /\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/
        )
      ) {
        return {
          ...rule,
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani)(\?.*)?$/,
        };
      }

      return rule;
    });
    // Allows us to import SCSS files in stories
    config.module.rules.push(
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
        include: [
          path.resolve(__dirname),
          path.resolve(__dirname, "..", "src"),
        ],
      },
      // use svgr for SVG in JSX
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: {
          test: /\.jsx?$/,
        },
        use: ["@svgr/webpack"],
      },
      // use svgr for SVG in TSX
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: {
          test: /\.tsx?$/,
        },
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              typescript: true,
            },
          },
        ],
      },
      // use url-loader for SVG in SASS
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: {
          test: /\.scss?$/,
        },
        use: ["file-loader"],
      }
    );

    return config;
  },
};
