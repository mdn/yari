#!/bin/bash


set -a
source testing/.env

# Temp sanity check
echo "$BUILD_ROOT"
echo "$BUILD_ARCHIVE_ROOT"
echo "$BUILD_ALLOW_STALE_TITLES"
echo "$BUILD_POPULARITIES_FILEPATH"

yarn run prebuild

node content build

yarn workspace functionaltests run test
