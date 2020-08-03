module.exports = {
  addons: [
    '@storybook/preset-create-react-app',
    {
      name: "@storybook/addon-docs",
      options: {
        configureJSX: true,
      },
    },
    '@storybook/addon-actions',
    '@storybook/addon-controls',
    '@storybook/addon-links',
  ],
};
