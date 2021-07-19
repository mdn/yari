#!/bin/bash
set -e

export ENV_FILE=testing/.env

# Temporary whilst only the functional tests use the autocomplete search widget.
export REACT_APP_AUTOCOMPLETE_SEARCH_WIDGET=true

yarn prepare-build
yarn build

yarn test:testing $@
