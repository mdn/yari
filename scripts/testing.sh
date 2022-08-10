#!/usr/bin/env sh

# Script equivalent of .github/workflows/testing.yml

set -e

echo "-------------------------"
echo "Install all yarn packages"
echo "-------------------------"

yarn --frozen-lockfile

echo "-------------"
echo "Lint prettier"
echo "-------------"

yarn prettier-check

echo "-----------"
echo "Lint ESLint"
echo "-----------"

yarn eslint

echo "-------------------"
echo "Unit testing client"
echo "-------------------"

yarn test:client

echo "----------------------"
echo "Build and start server"
echo "----------------------"

export ENV_FILE="testing/.env"
cp testing/.env client/

yarn build:prepare
yarn build

nohup yarn start:static-server > testing.log 2>&1 &
PID=$!

sleep 1

{
    curl --fail --retry-connrefused --retry 5 http://localhost:5042 > /dev/null

    echo "------------------"
    echo "Functional testing"
    echo "------------------"

    yarn test:testing
    yarn test:headless

    echo "-----------"
    echo "Stop server"
    echo "-----------"

    kill $PID
    rm client/.env
    rm testing.log

    echo "----------"
    echo "Result: ✅"
    echo "----------"
} || {
    kill $PID
    rm client/.env

    cat testing.log
    rm testing.log

    echo "----------"
    echo "Result: ❌"
    echo "----------"
}

echo "--------------------------"
echo "Basic m2h/h2m tool testing"
echo "--------------------------"

yarn md m2h markdown/tool/m2h --locale en-US
diff -s testing/content/files/en-us/markdown/tool/m2h/index.html testing/content/files/en-us/markdown/tool/m2h/expected.html
yarn md h2m markdown/tool/h2m --locale en-US
diff -s testing/content/files/en-us/markdown/tool/h2m/index.md testing/content/files/en-us/markdown/tool/h2m/expected.md
