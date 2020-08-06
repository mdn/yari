#!/bin/bash

CKSUM_BEFORE=$(cksum yarn.lock)
yarn install --ignore-scripts
EXIT_CODE=$?
CKSUM_AFTER=$(cksum yarn.lock)

if [[ $CKSUM_BEFORE != $CKSUM_AFTER ]]; then
  echo "yarn.lock was modified unexpectedly - terminating"
  exit 1
fi

exit $EXIT_CODE
