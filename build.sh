#!/bin/bash

pushd stumptown
# This really needs to become `npm run build-json *`
npm run build-json video
popd

pushd client
yarn run build
popd
