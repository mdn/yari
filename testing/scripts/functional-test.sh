#!/bin/bash
set -e

export ENV_FILE=testing/.env

yarn run prebuild

node content build

yarn workspace testing run test $@

# Pretend you wanna fix some fixable flaws.
# First in dry-run mode.
node content build -f web/bar --fix-flaws --fix-flaws-dry-run --fix-flaws-verbose
git status
git diff testing/content/files/en-us/web/bar/index.html
