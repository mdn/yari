#!/bin/bash

# react and react-dom are best upgraded together and at the moment
# dependabot does not support that kind of upgrades.
# This script helps the make sure all the reacts are upgrade together
# in one.

set -x

cd client
yarn upgrade react react-dom --latest
cd -

cd cli
yarn upgrade react react-dom --latest
cd -
