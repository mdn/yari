module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2020: true,
  },
  extends: ["eslint:recommended", "plugin:node/recommended"],
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
      files: ["**/*.test.js", "kumascript/tests/macros/utils.js"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      env: {
        jest: true,
      },
      globals: {
        page: "readonly",
        document: "readonly",
      },
      rules: {
        "jest/no-standalone-expect": [
          "error",
          {
            additionalTestBlockFunctions: ["itMacro", "withDeveloping"],
          },
        ],
        "jest/expect-expect": 0,
      },
    },
  ],
};
