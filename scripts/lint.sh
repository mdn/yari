#!/usr/bin/env sh

# Script equivalent of .github/workflows/testing.yml -> lint

set -e

echo "-------------------------"
echo "Install all npm packages"
echo "-------------------------"

npm ci

echo "-------------"
echo "Lint prettier"
echo "-------------"

npm run prettier-check

echo "-----------"
echo "Lint ESLint"
echo "-----------"

npm run eslint

echo "--------------"
echo "Lint stylelint"
echo "--------------"

npm run stylelint

echo "--------------"
echo "Check TypeScript"
echo "--------------"

npm run check:tsc
