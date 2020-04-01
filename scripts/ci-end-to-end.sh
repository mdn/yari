#!/bin/bash
set -ex


# TEMPORARILY...
# Because, at the time of writing, we don't have any real content checked in, we'll fake some.

mkdir -p ci-content/files/en-us/foo/bar
echo "<p>I'm alive!</p>" > ci-content/files/en-us/foo/bar/index.html
cat > ci-content/files/en-us/foo/bar/index.yaml <<YAML
title: 'Sample Title'
slug: Foo/Bar
YAML

yarn run prebuild
