module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:package-json/recommended",
  ],
  plugins: ["package-json"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  rules: {},
};
