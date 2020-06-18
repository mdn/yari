#!/bin/bash
set -e

export ENV_FILE=testing/.env

yarn run prebuild

node content build

yarn workspace testing run test $@

# Pretend you wanna fix some fixable flaws.
# First in dry-run mode.
node content build --quiet -f web/fixable_flaws --fix-flaws --fix-flaws-dry-run --fix-flaws-verbose
# Now actually, do it
node content build --quiet -f web/fixable_flaws --fix-flaws
git status | grep fixable_flaws/index.html # will fail if not in the output
git diff testing/content/files/en-us/web/fixable_flaws/index.html
