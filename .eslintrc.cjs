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
    ecmaVersion: 2020,
  },
  rules: {
    "one-var": ["error", "never"],
  },
  settings: {
    node: {
      resolvePaths: [__dirname],
      tryExtensions: [".js", ".json", ".node", ".tsx", ".ts"],
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
    {
      files: ["**/cli.js"],
      rules: {
        "node/shebang": 0,
        "no-process-exit": 0,
      },
    },
    {
      files: ["ssr/**/*.js"],
      parserOptions: {
        sourceType: "module",
      },
      rules: {
        "node/no-unsupported-features/es-syntax": [
          "error",
          {
            ignores: ["modules"],
          },
        ],
        "node/no-unpublished-import": "off",
      },
    },
  ],
};
