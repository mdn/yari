#!/usr/bin/env sh

# Script equivalent of .github/workflows/testing.yml -> test

set -e

echo "-------------------------"
echo "Install all npm packages"
echo "-------------------------"

npm ci

echo "-------------------"
echo "Unit testing client"
echo "-------------------"

npm run test:client

echo "----------------------"
echo "Build and start server"
echo "----------------------"

export ENV_FILE=".env.testing"

npm run build:prepare
npm run build:docs
npm run render:html

nohup npm run start:static-server > testing.log 2>&1 &
PID=$!

sleep 1

{
    curl --fail --retry-connrefused --retry 5 http://localhost:5042 > /dev/null

    echo "------------------"
    echo "Functional testing"
    echo "------------------"

    npm run test:testing
    npm run test:headless

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

npm run m2h -- markdown/tool/m2h --locale en-US
diff -s testing/content/files/en-us/markdown/tool/m2h/index.html testing/content/files/en-us/markdown/tool/m2h/expected.html
