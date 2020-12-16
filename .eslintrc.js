module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:import/recommended",
  ],
  plugins: ["node"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  overrides: [
    {
      files: ["**/package.json"],
      plugins: ["package-json"],
      extends: "plugin:package-json/recommended",
    },
    {
      files: ["**/*.test.js"],
      plugins: ["jest"],
      extends: "plugin:jest/recommended",
    },
  ],
};
