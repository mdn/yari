# Reviewing Yari changes

This document provides information on how to review changes to the yari repo.

## Before you start

Set up the yari repo and the corresponding [content repo](https://github.com/mdn/content) locally, as described in the [Yari quickstart](README.md#quickstart) guide. Once you've got them successfully set up, you can run the `yarn dev` command to start the MDN test site running locally on `localhost:3000`.

`yarn dev` is slower to execute than `yarn start` but it makes sure `client/build/` is clean, and it also reloads the SSR part of the site (it does a fresh Webpack build). This might matter after you've run `git pull && yarn`, since certain packages might be upgraded and it's always good to test with the latest.

Make sure you set the `CONTENT_ROOT` environment variable to an absolute path to the `content` repo `files` sub-directory before running `yarn dev`. This can be done using a command like `export CONTENT_ROOT=/Users/path/to/content/files`.

## General testing procedure

When you are tasked with reviewing a yari pull request, go to your local fork clone, switch to a new branch for testing, and pull the PR branch into it.

Next, run `yarn dev` and go to the local server to test out the change.

Provide feedback. Be helpful, and above all, welcoming and friendly.

## Testing KumaScript macro changes

The legacy [KumaScript](https://developer.mozilla.org/en-US/docs/MDN/Tools/KumaScript) macro system is available inside the yari repo in the [kumascript](https://github.com/mdn/yari/tree/master/kumascript) subdirectory.

Testing changes to KumaScript macros — whether you are making your own change or reviewing someone else's — is super easy with Yari. Once you have the development server running as described above, you can load up an MDN page that contains the appropriate macro call and see if it works.

If you need to update the macro, you can make a change to the relevant `.ejs` file (see the [macros](https://github.com/mdn/yari/tree/master/kumascript/macros) subdirectory), save it, and see the change in action immediately in your browser.
