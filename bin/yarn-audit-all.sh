#!/bin/bash

set -e

echo "DIFF file names:"
git diff --name-only origin/master
echo ""

function didyarnchange() {
    regex="(${1}/package\.json|${1}/yarn\.lock)"
    git diff --name-only origin/master | grep -E "$regex" && return
    false
}

if didyarnchange client; then
    echo "client packages changed"
    cd client
    yarn audit
    cd -
else
    echo "client did NOT change - no yarn audit"
fi

if didyarnchange cli; then
    echo "cli packages changed"
    cd cli
    yarn audit
    cd -
else
    echo "cli did NOT change - no yarn audit"
fi

if didyarnchange server; then
    echo "server packages changed"
    # Only care about the `>= high` warnings because this
    # workspace is only used for local development.
    yarn audit --level high
    cd -
else
    echo "server did NOT change - no yarn audit"
fi
