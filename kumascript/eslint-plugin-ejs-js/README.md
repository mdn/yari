# eslint-plugin-ejs-js

# EJS plugin for ESLint

## Current status

[![NPM version](https://img.shields.io/npm/v/eslint-plugin-ejs-js.svg)](https://www.npmjs.com/package/eslint-plugin-ejs-js)
[![Build Status](https://img.shields.io/travis/overlookmotel/eslint-plugin-ejs-js/master.svg)](http://travis-ci.org/overlookmotel/eslint-plugin-ejs-js)
[![Dependency Status](https://img.shields.io/david/overlookmotel/eslint-plugin-ejs-js.svg)](https://david-dm.org/overlookmotel/eslint-plugin-ejs-js)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookmotel/eslint-plugin-ejs-js.svg)](https://david-dm.org/overlookmotel/eslint-plugin-ejs-js)
[![Greenkeeper badge](https://badges.greenkeeper.io/overlookmotel/eslint-plugin-ejs-js.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/overlookmotel/eslint-plugin-ejs-js/master.svg)](https://coveralls.io/r/overlookmotel/eslint-plugin-ejs-js)

## Usage

ESLint plugin for EJS (embedded Javascript templates). Implemented entirely in Javascript.

```
npm install --save-dev eslint eslint-plugin-ejs-js
```

Add `ejs-js` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```js
{
  "plugins": [
    "ejs-js"
  ]
}
```

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookmotel/eslint-plugin-ejs-js/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookmotel/eslint-plugin-ejs-js/issues

## Contribution

Pull requests are very welcome. Please:

- ensure all tests pass before submitting PR
- add an entry to changelog
- add tests for new features
- document new functionality/API additions in README
