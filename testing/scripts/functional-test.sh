#!/bin/bash
set -e

export ENV_FILE=.env.testing

yarn build:prepare
yarn build
yarn render:html

yarn test:testing $@
