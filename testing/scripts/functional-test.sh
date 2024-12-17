#!/bin/bash
set -e

export ENV_FILE=.env.testing

yarn build:prepare
yarn build:legacy
yarn render:html

yarn test:testing $@
