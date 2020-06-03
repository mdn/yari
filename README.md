# Yari

<!-- https://help.github.com/en/actions/configuring-and-managing-workflows/configuring-a-workflow#adding-a-workflow-status-badge-to-your-repository -->

![](https://github.com/mdn/yari/workflows/Testing%20Yari/badge.svg)

## Quickstart

These steps should get you started, locally, straight away:

    git clone https://github.com/mdn/yari.git
    cd yari
    yarn
    yarn start
    open http://localhost:3000

To really understand how it starts and how to break down the various
tools, open `Procfile` or the `package.json`. Or, read on...

If you prefer, you can fork the repo first and do the `git clone` with
*your* fork instead of the `mdn` one.

### How to stay up-to-date

Periodically, the code and the content changes. Make sure you're staying
up-to-date with these commands:

    git pull origin master
    yarn
    yarn clean
    yarn start

These are also good steps to always take when you embark to make a change.
Then, the only extra command needed is `git checkout -b my-new-branch`
(or however you prefer to create new `git` branches)

## License

All source code is MPL-2.0.

For content, see [issue #408](https://github.com/mdn/yari/issues/408).

## How it works

Yari is multiple things but at its core is the MDN content as `index.html`
files, in `git`, that contain the metadata (as front-matter) and
the bulk of the document.

The builder converts these "source files" into "build files" using a CLI tool
that iterates over the files, builds the HTML, and lastly packages it up
with the front-end code. Ready to be served as static file.

## Development

First of all, development on `yari` can mean the source code (e.g. the
styling of the header) or it can mean the content, since it's all one
repo. This document doesn't distinguish between the two. In the future we
might expand with more documentation specifically for contributing on the
content exclusively.

The `yarn start` command encapsulates the front-end dev server
(on `localhost:3000`) and the `server` (on `localhost:5000`)
as well as the `watcher`. What the `watcher` does is that when a `index.html`
file changes (or is added!) it triggers a build of it.
The `yarn start` command also first runs a command that gathers up *all*
the document URLs and their titles (plus some other metadata). This can
take a while but it's cached to disk and is automatically invalidated if
any of the source code changes.

All the sub-commands of `yarn start` can be broken down and run individually
if you want to work more rapidly.

### Setting up `$EDITOR`

If you configure an environment variable called `EDITOR`, either on your
system as a whole or in the root `.env` file, it can be used in the development
server to link to sources which, when clicked, opens in
your preferred editor/IDE. For example, in the root:

    echo 'EDITOR=code' >> .env

Now clicking certain links will open files directly in the currently open
VSCode IDE. To test it, view any document on `http://localhost:3000` and
click the "Edit in your editor" button.

### How the server works

The `server` has two main jobs:

1. Simulate what it would be like to statically serve the site (e.g. a CDN)
2. Trigger builds of documents that haven't been built, by URL.

If you don't use the server you can manually use the CLI to build a page.
For example:

    node content build -l en-us -f we/html/element

...will build all documents that match that folder prefix. But you don't
need to do that up front since the server will "fill in the gaps" by
triggering a build if you simply try to view it.

### Linting

All JavaScript and TypeScript code needs to be formatted with `prettier`
and it's easy to test this with:

    yarn prettier-check

And conviently, if you're not even interested in what the flaws were, run:

    yarn prettier-format

But automatically when you ran `yarn` the first time (`yarn` is alias for
`yarn install`) it set up a `git` pre-commit hook that uses `pretty-quick`
which is a wrapper on `prettier` that checks only the files in the git
commit.

If in doubt about formatting, you can create a pull request and if you have
formatting flaws, the pull request checks should catch it.

### Adding dependencies

To add a new `yarn` dependency into one of the workspaces, start
a shell in the root directory. From there, type:

    yarn workspace client add some-lib
    # or...
    yarn workspace ssr add --dev some-package@1.2.4

This will update the `/yarn.lock` file and your `/node_modules`.

**Note!** Due to a bug in `yarn` v1, you have to run `yarn install --ignore-scripts`
one extra time so that the `/yarn.lock` file gets corrected. We hope to remove
this requirement when we can switch to `yarn` v2 in 2020. For now, to make it
easier for you, we have this added as a `huskey` `pre-commit` hook so simply
committing your changes will fix it for you automatically.

### Upgrading Packages

We maintain the dependencies using `Dependabot` in GitHub but if you want
to manually upgrade some you can use:

    yarn outdated

If it mentions outdated packages, run and select the packages you want to
upgrade:

    yarn upgrade-interactive

## Building

The `server` builds content automatically (on-the-fly) when you're viewing
pages. But if you want to you can pre-emptively build all the content
in advance. One potential advantage is that you can get a more complete
list of all possible "flaws" across all documents before you even visit them.
The most fundamental CLI command is:

    yarn prebuild  # if you haven't run 'yarn start' recently
    node content build

You can use `--help` to find various options such as filtering. For example,
to build all `en-US` documents under the `Web/CSS/` subtree, you can run this:

    node content build -l en-us -f web/css

The files get put into the `client/build/` and that folder should be ready
to be uploaded to static file hosting.

### What gets built

Every `index.html` becomes three files:

* `index.html` fully formed and complete HTML file
* `index.json` the React needed state to build the page in the client
* `index.hash` a short hash digest of the cache key used to build this page

### Caching

When building, we attempt to use a disk-based cache. It computes a hash
for every document by combining...

* The content of the `index.html` file.
* The combined source code of all `.js`, `.tsx`, and also all `package.json`
  and `yarn.lock`.

If you run `node content build -l en-us -f web/css` *twice* you'll find it
runs *much* faster the second time. But any little change to any source
code file should invalidate the cache.

### Flaw checks

When building you can enable specific "flaw checks" and their level of
handling. Some flaws are "cosmetic" and some are more
severe but they should never block a full build.

More information about how to set flaws can be found in `docs/envvars.md`.

Essentially, the default is to *warn* about any flaw and you can see
those flaws when using `http://localhost:3000`. But for finish builds,
all flaws are ignored. This makes the build faster and there's also
no good place to display the flaws in a production-grade build.

**In the future**, we might make the default flaw level `error` instead.
That means that any new edits (or creation) to any document will break
in continuous integration if there's a single flaw and the onus will
be on you to fix it.

## Icons and logos

The various formats and sizes of the favicon is generated
from the file `mdn-web-docs.svg` in the repository root. This file is then
converted to favicons using [realfavicongenerator.net](https://realfavicongenerator.net/).
To generate new favicons, edit or replace the `mdn-web-docs.svg` file
and then re-upload that to realfavicongenerator.net.
