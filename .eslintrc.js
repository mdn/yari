module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2020: true,
    "jest/globals": true,
  },
  extends: ["eslint:recommended", "plugin:node/recommended"],
  plugins: ["jest"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  rules: {},
};
