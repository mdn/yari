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
      files: ["**/*.test.js", "kumascript/tests/macros/utils.js"],
      globals: {
        page: true,
      },
      plugins: ["jest"],
      extends: "plugin:jest/recommended",
      rules: {
        "jest/no-standalone-expect": [
          "error",
          {
            additionalTestBlockFunctions: ["itMacro", "withDeveloping"],
          },
        ],
        "no-unused-vars": 0,
        "node/no-deprecated-api": 0,
        "jest/valid-title": 0,
        "no-useless-escape": 0,
        "no-undef": 0,
        "jest/expect-expect": 0,
        "jest/no-conditional-expect": 0,
      },
    },
    {
      files: ["**/cli.js"],
      rules: {
        "node/shebang": 0,
        "no-process-exit": 0,
      },
    },
  ],
};
