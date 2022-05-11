#!/usr/bin/env sh
set -ex

yarn test:prepare
yarn start:static-server > /tmp/stdout.log 2> /tmp/stderr.log &
sleep 1
curl --fail --retry-connrefused --retry 5 http://localhost:5042 > /dev/null
