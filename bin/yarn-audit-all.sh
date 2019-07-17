#!/bin/bash

set -ex

echo "DIFF:"
git diff --name-only origin/master


CLIENT_CHANGED=$(
    git diff --name-only origin/master | grep -E '(client/package\.json|client/yarn\.lock)')
CLI_CHANGED=$(
    git diff --name-only origin/master | grep -E '(cli/package\.json|cli/yarn\.lock)')
SERVER_CHANGED=$(
    git diff --name-only origin/master | grep -E '(server/package\.json|server/yarn\.lock)')

echo $CLIENT_CHANGED
echo $CLI_CHANGED
echo $SERVER_CHANGED

if [ $CLIENT_CHANGED ]; then
  echo "Client changed!"
else
  echo "Client did NOT change"
fi

if [ $CLI_CHANGED ]; then
  echo "Cli changed!"
else
  echo "Cli did NOT change"
fi

if [ $SERVER_CHANGED ]; then
  echo "Server changed!"
else
  echo "Server did NOT change"
fi


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
