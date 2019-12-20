#!/bin/bash
set -ex

# If you run this locally, the jest test runner will
# start in interactive mode. To make it like in CI
# execute this script like `CI=true ./scripts/ci-client.sh

yarn workspace client run test
yarn workspace client run build
