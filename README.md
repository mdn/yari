# Yari

![Testing](https://github.com/mdn/yari/workflows/Testing%20Yari/badge.svg)
![Production Build](https://github.com/mdn/yari/workflows/Production%20Build/badge.svg)

## Quickstart

Development on `yari` involves updating the machinery that renders MDN content
or improving the structure and styling of the MDN UI (e.g. the
styling of the header). If you are more interested in contributing to the MDN
content, you should check out the [content](https://github.com/mdn/content) repo
README instead.

Before you can start working with Yari, you need to:

<!-- Peterbe, Feb 2021: There appears to be a bug in Prettier for .md files
    that forces in a second (extra) whitespace after the `1.` here.
    That breaks `markdownlint` *and* `prettier --check`. Annoying.
    So for now let's make an exception. -->
<!-- markdownlint-disable list-marker-space -->

1.  Install [git](https://git-scm.com/),
    [Node.js](https://nodejs.org) (>= 12.0.0), and [Yarn 1](https://classic.yarnpkg.com/en/docs/install).

1.  [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo)
    the MDN [content](https://github.com/mdn/content) and [yari](https://github.com/mdn/yari)
    repositories using the Fork button on GitHub.

1.  Clone the forked repositories to your computer using the following commands
    (replace `[your account]` with the account you forked the repositories to):

            git clone https://github.com/[your_account]/content.git
            git clone https://github.com/[your_account]/yari.git

        Take a note of the file path to the location where you've cloned that
        repo before moving on.

    <!-- markdownlint-enable list-marker-space -->

To run Yari locally, you'll first need to install its dependencies and build the
app locally. Do this like so:

    cd yari
    yarn install

Now run the following command to create a `.env` file inside your `yari` repo
root and set the `CONTENT_ROOT` environment variable equal to the path to the
`content` repo. This is so the Yari app can find the content it needs to render.
You'll need to replace `/path/to/mdn/content/files` with the path to the
`/files` folder inside your clone of the `content` repo:

    echo CONTENT_ROOT=/path/to/mdn/content/files >> .env

At this point, you can get started. Run the following lines to compile required
files, start the Yari web server running, and open it in your browser:

    yarn dev
    open http://localhost:3000

If you prefer you can use `yarn start`, which will re-use any previously
compiled files; this is "riskier" but faster. `yarn dev` always ensures that
everything is up-to-date.

The `yarn start` command also starts a server with slightly different behavior —
it doesn't automatically reload when its source code files change,
so use with caution.

See also our [reviewing guide](docs/REVIEWING.md) for information on how to
review Yari changes.

### How to stay up-to-date

Periodically, the code and the content changes. Make sure you stay
up-to-date with something along the following lines (replace `yari-origin`
with whatever you called [the remote location](https://git-scm.com/docs/git-remote)
of the original yari repo):

    git pull yari-origin main
    yarn
    yarn dev

When you embark on making a change, do it on a new branch, for example
`git checkout -b my-new-branch`.

## License

All source code is [MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/).

For content, see its [license](https://github.com/mdn/content/blob/main/LICENSE.md)
in the [mdn/content repository](https://github.com/mdn/content).

## How it works

Yari does a number of things, the most important of which is to render and serve
the MDN content found in the [content repo](https://github.com/mdn/content).
Each document is stored as an `index.html` file that contains metadata presented
as YAML [front-matter](https://github.com/mdn/content#fundamental-concepts)
followed by the document source.

The builder converts these "source files" into "build files" using a CLI tool
that iterates over the files, builds the HTML, and lastly packages it up
with the front-end code, ready to be served as static files.

## Development

The `yarn start` command encapsulates the front-end dev server
(on <http://localhost:3000>) and the `server` (on <http://localhost:5000>).

All the sub-commands of `yarn start` can be broken down and run individually
if you want to work more rapidly.

### Setting up `$EDITOR`

If you configure an environment variable called `EDITOR`, either on your
system as a whole or in the root `.env` file, it can be used in the development
server to link to sources which, when clicked, open in your preferred
editor/IDE. For example, in the root of the repo you could run:

    echo 'EDITOR=code' >> .env

Now clicking certain links will open files directly in the currently open
VS Code IDE (replace `code` in the above command with a different text editor
name if needed, e.g. `atom` or whatever). To test it, view any document on
<http://localhost:3000> and click the "Open in your editor" button.

### How the server works

The `server` has two main jobs:

1. Simulate serving the site (e.g. from a server, S3 or a CDN).
2. Trigger builds of documents that haven't been built, by URL.

### Linting

All JavaScript and TypeScript code needs to be formatted with `prettier`
and it's easy to test this with:

    yarn prettier-check

And conveniently, if you're not even interested in what the flaws were, run:

    yarn prettier-format

When you ran `yarn` for the first time (`yarn` is an alias for
`yarn install`) it automatically sets up a `git` pre-commit hook that uses
`pretty-quick` — a wrapper for `prettier` that checks only the files in the git
commit.

If you have doubts about formatting, submit your pull request anyway. If you
have formatting flaws, the [pull request checks](https://github.com/features/actions)
should catch it.

### Upgrading Packages

We maintain the dependencies using `Dependabot` in GitHub but if you want
to manually upgrade them you can use:

    yarn upgrade-interactive --latest

### Sharing your dev environment with `ngrok`

[`ngrok`](https://ngrok.com/) allows you to start an HTTP proxy
server from the web into your Yari server. This can be useful for testing
your current build using external tools like BrowserStack, WebPageTest, or
Google Translate, or to simply show a friend what you're up to. Obviously
it'll never be faster than your uplink Internet connection but it should
be fairly feature-complete.

1. [Create in account on Ngrok.com](https://dashboard.ngrok.com/signup)
2. [Download the executable](https://ngrok.com/download)
3. Start your Yari server with `yarn start` in one terminal
4. Start the `ngrok` executable with: `/path/to/your/ngrok http 5000`

This will display something like this:

    Session Status                online
    Account                       (Plan: Free)
    Version                       2.3.35
    Region                        United States (us)
    Web Interface                 http://127.0.0.1:4040
    Forwarding                    http://920ba2108da8.ngrok.io -> http://localhost:5000
    Forwarding                    https://920ba2108da8.ngrok.io -> http://localhost:5000

    Connections                   ttl     opn     rt1     rt5     p50     p90
                                  0       0       0.00    0.00    0.00    0.00

Now, take that "Forwarding" URL (`https://920ba2108da8.ngrok.io` in this
example) and share it.

## Building

The `server` builds content automatically (on-the-fly) when you're viewing
pages, but you can pre-emptively build all the content in advance if desired.
One potential advantage is that you can get a more complete list of all possible
"flaws" across all documents before you even visit them.

The most fundamental CLI command is:

    yarn build

### What gets built

Every `index.html` becomes two files:

- `index.html` — a fully formed and complete HTML file
- `index.json` — the state information React needs to build the page in the
  client

### Flaw checks

When building you can enable specific "flaw checks" and their level of
handling. Some flaws are "cosmetic" and some are more
severe but they should never block a full build.

More information about how to set flaws can be found in `docs/envvars.md`.

Essentially, the default is to _warn_ about any flaw and you can see
those flaws when using <http://localhost:3000>. For completed builds,
all flaws are ignored. This makes the build faster and there's also
no good place to display the flaws in a production-grade build.

**In the future**, we might make the default flaw level `error` instead.
That means that any new edits to (or creation of) any document will break
in continuous integration if there's a single flaw and the onus will
be on you to fix it.

## Icons and logos

The various formats and sizes of the favicon are generated
from the file `mdn-web-docs.svg` in the repository root. This file is then
converted to favicons using [realfavicongenerator.net](https://realfavicongenerator.net/).
To generate new favicons, edit or replace the `mdn-web-docs.svg` file
and then re-upload that to realfavicongenerator.net.

## Troubleshooting

Some common issues and how to resolve them.

### `Error: ENOSPC: System limit for number of file watchers reached`

There are two options to resolve this.

1. Disable the watcher via [`REACT_APP_NO_WATCHER`](docs/envvars.md#react_app_no_watcher)

   `echo REACT_APP_NO_WATCHER=true >> .env`

2. Increase `max_user_watches`:\
   See <https://github.com/guard/listen#increasing-the-amount-of-inotify-watchers>

### `Error: Cannot find module 'levenary'`

We can't know for sure what's causing this error but speculate a bug in how `yarn`
fails to resolve if certain `@babel` helper libs should install its own
sub-dependencies. A sure way to solve it is to run:

    rm -fr node_modules
    yarn install

### `Error: listen EADDRINUSE: address already in use :::5000`

The default server port `:5000` might be in use by another process. To resolve this,
you can pick any unused port (e.g., 6000) and run the following:

    echo SERVER_PORT=6000 >> .env
