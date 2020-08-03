import { create } from "@storybook/theming/create";

export default create({
  base: "light",

  colorPrimary: "#1e7f9d",
  colorSecondary: "#212121",

  // UI
  appBg: "white",
  appContentBg: "white",
  appBorderColor: "grey",
  appBorderRadius: 4,

  // Typography
  fontBase: "Arial, sans-serif",
  fontCode: "monospace",

  // Text colors
  textColor: "#212121",
  textInverseColor: "#ffffff",

  // Toolbar default and active colors
  barTextColor: "#fff",
  barSelectedColor: "#fff",
  barBg: "#212121",

  // Form colors
  inputBg: "white",
  inputBorder: "silver",
  inputTextColor: "black",
  inputBorderRadius: 4,

  brandTitle: "MDN Web Docs",
  brandUrl: "https://developer.mozilla.org/",
  brandImage: "https://developer.mozilla.org/static/img/web-docs-sprite.svg"
});
