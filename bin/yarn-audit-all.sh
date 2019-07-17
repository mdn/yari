#!/bin/bash

set -ex


cd client
yarn audit
cd -

cd cli
yarn audit
cd -

cd server
# Only care about the `>= high` warnings because this
# workspace is only used for local development.
yarn audit --level high
cd -
