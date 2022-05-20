#!/bin/bash
set -e

export ENV_FILE=testing/.env

npm run build:prepare
npm run build

npm run test:testing -- $@
