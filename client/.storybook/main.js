module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    {
      name: "@storybook/preset-create-react-app",
      options: {
        scriptsPackageName: "react-scripts",
      },
    },
  ],
};
