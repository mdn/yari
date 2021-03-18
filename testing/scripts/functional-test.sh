#!/bin/bash
set -e

export ENV_FILE=testing/.env

# Temporary whilst only the functional tests use the autocomplete search widget.
export REACT_APP_AUTOCOMPLETE_SEARCH_WIDGET=true

# Temporary until we're still using the old Kuma for signin in.
export REACT_APP_USE_YARI_SIGNIN=true

yarn prepare-build
yarn build

yarn test:testing $@
