#!/usr/bin/env sh

# Script equivalent of .github/workflows/testing.yml -> lint

set -e

echo "-------------------------"
echo "Install all yarn packages"
echo "-------------------------"

yarn --frozen-lockfile

echo "-------------"
echo "Lint prettier"
echo "-------------"

yarn prettier-check

echo "-----------"
echo "Lint ESLint"
echo "-----------"

yarn eslint

echo "--------------"
echo "Lint stylelint"
echo "--------------"

yarn stylelint

echo "--------------"
echo "Check TypeScript"
echo "--------------"

yarn check:tsc