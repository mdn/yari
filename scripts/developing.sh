#!/usr/bin/env sh

# Script equivalent of .github/workflows/developing.yml

set -e

echo "--------------------"
echo "Checkout mdn/content"
echo "--------------------"

if [ -d "mdn/content/.git" ]; then
  pushd mdn/content
  git checkout main
  git fetch
  git reset --hard origin/main
  popd
else
  rm -rf mdn/content
  mkdir -p mdn
  git clone --depth=1 https://github.com/mdn/content.git mdn/content
fi

echo "-------------------------"
echo "Install all yarn packages"
echo "-------------------------"

yarn --frozen-lockfile

echo "--------------------"
echo "Start the dev server"
echo "--------------------"

export REACT_APP_WRITER_MODE=true
export CONTENT_ROOT="mdn/content/files"
ls "$CONTENT_ROOT/en-us/mdn/kitchensink"
echo "" > client/.env

yarn build:prepare

yarn start > developing.log 2>&1 &
PID=$!

{
    sleep 3

    curl --retry-connrefused --retry 5 http://localhost:5042 > /dev/null
    curl --retry-connrefused --retry 5 --silent http://localhost:3000 > /dev/null

    echo "---------------------------"
    echo "Test viewing the dev server"
    echo "---------------------------"

    yarn test:developing

    echo "-----------"
    echo "Stop server"
    echo "-----------"

    kill $PID
    rm client/.env
    rm developing.log

    echo "----------"
    echo "Result: ✅"
    echo "----------"
} || {
    echo "-----------"
    echo "Stop server"
    echo "-----------"

    kill $PID
    rm client/.env

    cat developing.log
    rm developing.log

    echo "----------"
    echo "Result: ❌"
    echo "----------"
}

