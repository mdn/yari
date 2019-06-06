#!/bin/bash

set -x

cd client
yarn outdated
cd -

cd cli
yarn outdated
cd -

cd server
yarn outdated
cd -

#cd stumptown
#echo "NOTE! Stumptown is a git submodule!"
#yarn outdated
#cd -
