#!/bin/bash

export ENV_FILE=testing/.env

yarn run prebuild

node content build

# It's not yet clear which is best.
# See https://jestjs.io/docs/en/troubleshooting#tests-are-extremely-slow-on-docker-andor-continuous-integration-ci-server
# and https://www.peterbe.com/plog/ideal-number-of-workers-in-jest-maxWorkers

# The default where jest can attempt to run as much in parallel as possible
yarn workspace testing run test $@
# This is shorthand for `--maxWorkers=2`
# yarn workspace testing run test --runInBand
# Example of manually fine-tuning the number
# yarn workspace testing run test --maxWorkers=2
