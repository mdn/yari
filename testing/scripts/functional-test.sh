#!/bin/bash
set -e

export ENV_FILE=testing/.env

yarn prepare-build
yarn build

yarn test:testing $@
