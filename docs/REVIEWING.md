# Reviewing Yari changes

This document provides information on how to review changes to the Yari repo.

## Before you start

Set up the Yari repo and the corresponding [content repo](https://github.com/mdn/content)
locally, as described in the [Yari quickstart](../README.md#quickstart) guide. Once
you've got them successfully set up, run the `yarn` and `yarn dev` commands to
update your fork with the latest packages and start the MDN test server running
locally on `localhost:3000`.

`yarn dev` is slower to execute than `yarn start` but it makes sure `client/build/`
is clean, and it also reloads the SSR part of the site (it does a fresh `webpack`
build). This might matter after you've run `git pull` & `yarn`, since certain
packages might be upgraded and it's always good to
test with a clean, up-to-date build.

Make sure you set the `CONTENT_ROOT` environment variable to an absolute path to
the `content` repo `files` subdirectory before running `yarn dev`, so Yari can
find the content to render. This can be done using an `export` command like:

```bash
export CONTENT_ROOT=/Users/path/to/content/files
```

But this only sets it temporarily. A better solution is to write it to an `.env`
file by running the following in your yari root directory:

```bash
echo CONTENT_ROOT=/Users/path/to/content/files >> .env
```

This will add the variable definition to an `.env` file, creating one if you
don't already have it.

## General testing procedure

When you are tasked with reviewing a Yari pull request:

1. Go to your local fork clone, switch to a new branch for testing, and pull the
   PR branch into it.
2. Next, run `yarn` to pull in any package changes, then `yarn dev` to build the
   site and start the local server.
3. Now go to the local server (<http://localhost:3000>) to test the change.
4. Provide feedback. Be helpful, and above all, welcoming and friendly.

## Testing KumaScript macro changes

The legacy [KumaScript](https://developer.mozilla.org/en-US/docs/MDN/Tools/KumaScript)
macro system is available inside the yari repo in the
[kumascript](https://github.com/mdn/yari/tree/main/kumascript) subdirectory.

Testing changes to KumaScript macros — whether you are making your own change or
reviewing someone
else's — is super easy with Yari. Once you have the development server running
as described above, you can load up an MDN page that contains the appropriate
macro call and see if it works.

If you need to update a macro, you can make a change to the relevant `.ejs` file
(see the [macros](https://github.com/mdn/yari/tree/main/kumascript/macros) subdirectory),
save it, and reload the page in your browser to see the change in action
immediately.
