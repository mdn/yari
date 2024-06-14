#!/usr/bin/env sh

# Script equivalent of .github/workflows/testing.yml -> test

set -e

echo "-------------------------"
echo "Install all yarn packages"
echo "-------------------------"

yarn --frozen-lockfile

echo "-------------------"
echo "Unit testing client"
echo "-------------------"

yarn test:client

echo "----------------------"
echo "Build and start server"
echo "----------------------"

export ENV_FILE=".env.testing"

yarn build:prepare
yarn build:json
yarn render:html

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

echo "----------------------"
echo "Basic m2h tool testing"
echo "----------------------"

yarn m2h markdown/tool/m2h --locale en-US
diff -s testing/content/files/en-us/markdown/tool/m2h/index.html testing/content/files/en-us/markdown/tool/m2h/expected.html
