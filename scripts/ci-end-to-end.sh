#!/bin/bash
set -e


# TEMPORARILY...
# Because, at the time of writing, we don't have any real content checked in, we'll fake some.

mkdir -p ci-content/files/en-us/foo/bar
echo "<p>I'm alive!</p>" > ci-content/files/en-us/foo/bar/index.html
cat > ci-content/files/en-us/foo/bar/index.yaml <<YAML
title: 'Foo Bar'
slug: Foo/Bar
YAML
cat > ci-content/files/en-us/foo/bar/wikihistory.json <<JSON
{
  "modified": "2020-03-27T04:29:28.234Z",
  "_generated": "2020-04-01T15:02:53.589Z",
  "contributors": [
    "peterbe"
  ]
}
JSON

export BUILD_ROOT=ci-content/files
yarn run prebuild
# The `_all-titles.json` file is an implementation detail but it's nice to
# know it gets created.
cat content/_all-titles.json
# The folder should have been created
echo "Contents of client/build/static..."
ls -lh client/build/static/

# Actually do the build!
node content build

echo "Contents of client/build/..."
ls -ltr client/build/

# It should have built this folder too
echo "Contents of client/build/en-us/docs/foo/bar..."
ls -ltr client/build/en-us/docs/foo/bar

# Expect this file to have been created
echo "Contents of client/build/en-us/titles.json"
cat client/build/en-us/titles.json


# It should never create a build folder called 'en-US'
# It should always only be 'en-us'.
if [ -d client/build/en-US ]; then
  echo "client/build/en-US should never have been created."
  echo "(only lower case please!)"
  exit 1
fi

node scripts/end-to-end-test.js
