#!/bin/bash
set -e

export ENV_FILE=.env.testing

npm run build:prepare
npm run build:docs
npm run render:html

npm run test:testing -- $@
