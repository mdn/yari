#!/bin/bash
set -e

export ENV_FILE=.env.testing

yarn build:prepare
yarn build:docs
yarn render:html

yarn test:testing $@
