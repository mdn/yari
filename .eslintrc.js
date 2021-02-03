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
  extends: [
    "eslint:all",
    "plugin:node/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["jest"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2019,
  },
  rules: {
    "consistent-return": "off",
    "default-param-last": "off",
    "func-names": "off",
    "func-style": "off",
    "id-length": "off",
    "init-declarations": "off",
    "line-comment-position": "off",
    "max-classes-per-file": "off",
    "max-depth": "off",
    "max-lines-per-function": "off",
    "max-lines": "off",
    "max-params": "off",
    "max-statements": "off",
    "multiline-comment-style": "off",
    "no-await-in-loop": "off",
    "no-console": "off",
    "no-constructor-return": "off",
    "no-continue": "off",
    "no-empty-function": "off",
    "no-eq-null": "off",
    "no-inline-comments": "off",
    "no-invalid-this": "off",
    "no-magic-numbers": "off",
    "no-multi-assign": "off",
    "no-negated-condition": "off",
    "no-new-func": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "no-return-await": "off",
    "no-shadow": "off",
    "no-ternary": "off",
    "no-undefined": "off",
    "no-underscore-dangle": "off",
    "no-use-before-define": "off",
    "no-void": "off",
    "no-warning-comments": "off",
    "one-var": ["error", "never"],
    "prefer-destructuring": "off",
    "prefer-named-capture-group": "off",
    "require-atomic-updates": "off",
    "require-await": "off",
    "require-unicode-regexp": "off",
    "sort-imports": "off",
    "sort-keys": "off",
    camelcase: "off",
    complexity: "off",
    eqeqeq: "off",
    radix: "off",
    strict: "off",
    // auto-fixable rules
    "capitalized-comments": "off",
    "prefer-object-spread": "off",
  },
  settings: {
    node: {
      allowModules: ["expect-puppeteer"],
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
