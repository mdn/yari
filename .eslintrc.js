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
  extends: ["eslint:recommended", "plugin:n/recommended"],
  plugins: ["jest"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  rules: {
    "one-var": ["error", "never"],
  },
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        "n/shebang": "off",
        "@typescript-eslint/no-var-requires": "off",
        "n/no-missing-import": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
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
        "n/shebang": 0,
        "no-process-exit": 0,
      },
    },
    {
      files: ["ssr/**/*.js"],
      parserOptions: {
        sourceType: "module",
      },
      rules: {
        "n/no-unsupported-features/es-syntax": [
          "error",
          {
            ignores: ["modules"],
          },
        ],
        "n/no-unpublished-import": "off",
      },
    },
  ],
};
