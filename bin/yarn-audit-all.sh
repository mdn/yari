#!/bin/bash

set -ex


cd client
yarn audit
cd -

cd cli
yarn audit
cd -

cd server
yarn audit
cd -

#cd stumptown
#echo "NOTE! Stumptown is a git submodule!"
#yarn audit
#cd -
