#!/usr/bin/env sh
set -ex

export ENV_FILE=testing/.env

yarn md m2h markdown/tool/m2h --locale en-US
diff -s testing/content/files/en-us/markdown/tool/m2h/index.html testing/content/files/en-us/markdown/tool/m2h/expected.html

yarn md h2m markdown/tool/h2m --locale en-US
diff -s testing/content/files/en-us/markdown/tool/h2m/index.md testing/content/files/en-us/markdown/tool/h2m/expected.md