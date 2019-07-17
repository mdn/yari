#!/bin/bash

set -e

# echo "DIFF:"
# git diff --name-only origin/master

function didyarnchange() {
    regex="(${1}/package\.json|${1}/yarn\.lock)"
    git diff --name-only origin/master | grep -E "$regex" && return
    false
}

if didyarnchange client; then
    echo "Client changed!"
    cd client
    yarn audit
    cd -
else
    echo "Client did NOT change"
fi

if didyarnchange cli; then
    echo "Cli changed!"
    cd cli
    yarn audit
    cd -
else
    echo "Cli did NOT change"
fi

if didyarnchange server; then
    echo "Server changed!"
    # Only care about the `>= high` warnings because this
    # workspace is only used for local development.
    yarn audit --level high
    cd -

else
    echo "server did NOT change"
fi

# if [ $SERVER_CHANGED ]; then
#   echo "Server changed!"
# else
#   echo "Server did NOT change"
# fi



# cd client
# yarn audit
# cd -

# cd cli
# yarn audit
# cd -

# cd server
# # Only care about the `>= high` warnings because this
# # workspace is only used for local development.
# yarn audit --level high
# cd -
