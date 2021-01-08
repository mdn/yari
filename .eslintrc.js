module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2020: true,
    "jest/globals": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:import/recommended",
  ],
  plugins: ["node", "jest"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  rules: {},
  settings: {
    node: {
      allowModules: ["expect-puppeteer"],
      resolvePaths: [__dirname],
      tryExtensions: [".js", ".json", ".node"],
    },
  },
  overrides: [
    {
      files: ["**/package.json"],
      plugins: ["package-json"],
      extends: "plugin:package-json/recommended",
    },
    {
      files: ["testing/**/*.js"],
      globals: {
        page: "readonly",
      },
    },
  ],
};
