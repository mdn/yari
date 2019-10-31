#!/bin/bash

# This file exists because as of yarn@1.12.3, --frozen-lockfile is completely
# broken when combined with Yarn workspaces. See https://github.com/yarnpkg/yarn/issues/6291
# Taken from https://github.com/yarnpkg/yarn/issues/4098#issuecomment-492729443

CKSUM_BEFORE=$(cksum yarn.lock)
yarn install
EXIT_CODE=$?
CKSUM_AFTER=$(cksum yarn.lock)
cat CKSUM_BEFORE
cat CKSUM_AFTER

if [[ $CKSUM_BEFORE != $CKSUM_AFTER ]]; then
  echo "yarn_frozen_lockfile.sh: yarn.lock was modified unexpectedly - terminating"
  exit 1
fi

exit $EXIT_CODE
