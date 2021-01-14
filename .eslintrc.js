const { readGitignoreFiles } = require("eslint-gitignore");
const path = require("path");
const ignores = readGitignoreFiles({
  cwd: path.join(".git", "info"),
  patterns: ["exclude"],
});

module.exports = {
  ignorePatterns: ignores,
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
  settings: {
    node: {
      allowModules: ["expect-puppeteer"],
      resolvePaths: [__dirname],
      tryExtensions: [".js", ".json", ".node"],
    },
  },
  overrides: [
    {
      files: ["testing/**/*.js"],
      globals: {
        page: "readonly",
        document: "readonly",
      },
    },
  ],
};
