# Yari

![Testing](https://github.com/mdn/yari/workflows/Testing%20Yari/badge.svg)
![Prod Build](https://github.com/mdn/yari/workflows/Prod%20Build/badge.svg)

## Quickstart

Development on `yari` involves updating the machinery that renders MDN content
or improving the structure and styling of the MDN UI (e.g. the styling of the
header). If you are more interested in contributing to the MDN content, you
should check out the [content](https://github.com/mdn/content) repo README
instead.

Before you can start working with Yari, you need to:

<!-- Peterbe, Feb 2021: There appears to be a bug in Prettier for .md files
    that forces in a second (extra) whitespace after the `1.` here.
    That breaks `markdownlint` *and* `prettier --check`. Annoying.
    So for now let's make an exception. -->
<!-- markdownlint-disable list-marker-space -->

1.  Install [git](https://git-scm.com/) and [Node.js](https://nodejs.org).

1.  [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo)
    the MDN [content](https://github.com/mdn/content) and
    [yari](https://github.com/mdn/yari) repositories using the Fork button on
    GitHub.

1.  Clone the forked repositories to your computer using the following commands
    (replace `[your account]` with the account you forked the repositories to):

        git clone https://github.com/[your_account]/content.git
        git clone https://github.com/[your_account]/yari.git

<!-- markdownlint-enable list-marker-space -->

To run Yari locally, you'll first need to install its dependencies and build the
app locally. Do this like so:

    cd yari
    npm install

See the [troubleshooting](#troubleshooting) section below if you run into
problems.

Now copy the `.env-dist` file to `.env`:

    cp .env-dist .env

If you followed the instructions above and cloned the `content` repo as a
sibling of your `yari` repo, the `CONTENT_ROOT` environment variable is already
set and Yari will be able to find the content it needs to render.

At this point, you can get started. Run the following lines to compile required
files, start the Yari web server running, and open it in your browser:

    npm run dev
    open http://localhost:3000

If you prefer you can use `npm run start`, which will re-use any previously
compiled files; this is "riskier" but faster. `npm run dev` always ensures that
everything is up-to-date.

The `npm run start` command also starts a server with slightly different
behavior — it doesn't automatically reload when its source code files change, so
use with caution.

See also our [reviewing guide](docs/REVIEWING.md) for information on how to
review Yari changes.

### Pull request requirements

Firstly, thank you for your interest in contributing to Yari! We do have a few
requirements when it comes to pull requests:

1. Please make use of a
   [feature branch workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow).
2. We prefer if you use the
   [conventional commits format](https://www.conventionalcommits.org/) when
   making pull requests.
3. Lastly, we require that all commits are signed. Please see the documentation
   [about signed commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
   and
   [how to sign yours](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
   on GitHub.

Thank you for your understanding! We look forward to your contributions.

### How to stay up-to-date

Periodically, the code and the content changes. Make sure you stay up-to-date
with something along the following lines (replace `yari-origin` with whatever
you called [the remote location](https://git-scm.com/docs/git-remote) of the
original yari repo):

    git pull yari-origin main
    npm install
    npm run dev

When you embark on making a change, do it on a new branch, for example
`git checkout -b my-new-branch`.

## License

All source code is [MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/).

For content, see its
[license](https://github.com/mdn/content/blob/main/LICENSE.md) in the
[mdn/content repository](https://github.com/mdn/content).

## Supported Platforms

`yari` runs on Linux in CI, and when building for Production.

We also support Windows and MacOS, however we don't aim to proactively catch
issues with CI on those platforms. If bugs arise, we welcome issues being filed,
or PRs being opened to fix them.

## How it works

Yari does a number of things, the most important of which is to render and serve
the MDN content found in the [content repo](https://github.com/mdn/content).
Each document is stored as an `index.md` (recommended) or `index.html` file that
contains metadata presented as YAML
[front-matter](https://github.com/mdn/content#fundamental-concepts) followed by
the document source.

The builder converts these "source files" into "build files" using a CLI tool
that iterates over the files, builds the HTML, and lastly packages it up with
the front-end code, ready to be served as static files.

## Development

The `npm run start` command encapsulates the front-end dev server (on
<http://localhost:3000>) and the `server` (on <http://localhost:5042>).

All the sub-commands of `npm run start` can be broken down and run individually
if you want to work more rapidly.

### Setting up `$EDITOR`

If you configure an environment variable called `EDITOR`, either on your system
as a whole or in the root `.env` file, it can be used in the development server
to link to sources which, when clicked, open in your preferred editor/IDE. For
example, in the root of the repo you could run:

    echo 'EDITOR=code' >> .env

Now clicking certain links will open files directly in the currently open VS
Code IDE (replace `code` in the above command with a different text editor name
if needed, e.g. `atom` or whatever). To test it, view any document on
<http://localhost:3000> and click the "Open in your editor" button.

### How the server works

The `server` has two main jobs:

1. Simulate serving the site (e.g. from a server, S3 or a CDN).
2. Trigger builds of documents that haven't been built, by URL.

### Linting

All JavaScript and TypeScript code needs to be formatted with `prettier` and
it's easy to test this with:

    npm run prettier-check

And conveniently, if you're not even interested in what the flaws were, run:

    npm run prettier-format

When you ran `npm install` for the first time it automatically sets up a `git`
pre-commit hook that uses `lint-staged` — a wrapper for `prettier` that checks
only the files in the git commit.

If you have doubts about formatting, submit your pull request anyway. If you
have formatting flaws, the
[pull request checks](https://github.com/features/actions) should catch it.

### Upgrading Packages

We maintain the dependencies using `Dependabot` in GitHub but if you want to
manually upgrade them you can use:

    npx npm-check -u

## Building

The `server` builds content automatically (on-the-fly) when you're viewing
pages, but you can pre-emptively build all the content in advance if desired.
One potential advantage is that you can get a more complete list of all possible
"flaws" across all documents before you even visit them.

The most fundamental CLI command is:

    npm run build

### What gets built

Every `index.html` becomes two files:

- `index.html` — a fully formed and complete HTML file
- `index.json` — the state information React needs to build the page in the
  client

### Flaw checks

When building you can enable specific "flaw checks" and their level of handling.
Some flaws are "cosmetic" and some are more severe but they should never block a
full build.

More information about how to set flaws can be found in `docs/envvars.md`.

Essentially, the default is to _warn_ about any flaw and you can see those flaws
when using <http://localhost:3000>. For completed builds, all flaws are ignored.
This makes the build faster and there's also no good place to display the flaws
in a production-grade build.

**In the future**, we might make the default flaw level `error` instead. That
means that any new edits to (or creation of) any document will break in
continuous integration if there's a single flaw and the onus will be on you to
fix it.

## Icons and logos

The various formats and sizes of the favicon are generated from the file
`mdn-web-docs.svg` in the repository root. This file is then converted to
favicons using [realfavicongenerator.net](https://realfavicongenerator.net/). To
generate new favicons, edit or replace the `mdn-web-docs.svg` file and then
re-upload that to realfavicongenerator.net.

## Contact

If you want to talk to us, ask questions, and find out more, join the discussion
on the
[MDN Web Docs chat room](https://chat.mozilla.org/#/room/#mdn:mozilla.org) on
[Matrix](https://wiki.mozilla.org/Matrix).

## Troubleshooting

Some common issues and how to resolve them.

### `Error: ENOSPC: System limit for number of file watchers reached`

There are two options to resolve this.

1. Disable the watcher via
   [`REACT_APP_NO_WATCHER`](docs/envvars.md#react_app_no_watcher)

   `echo REACT_APP_NO_WATCHER=true >> .env`

2. Increase `max_user_watches`:\
   See <https://github.com/guard/listen#increasing-the-amount-of-inotify-watchers>

### `Error: listen EADDRINUSE: address already in use :::5042`

The default server port `:5042` might be in use by another process. To resolve
this, you can pick any unused port (e.g., 6000) and run the following:

    echo SERVER_PORT=6000 >> .env

### npm install errors

If you get errors while installing dependencies via npm on a Mac, you may need
to install some additional packages. Check the error message for the package
name causing the problem.

1. First, install [brew](https://brew.sh/) if you haven’t already

1. To fix problems with `gifsicle`:

   brew install automake autoconf libtool

1. To fix problems with `pngquant-bin`:

   brew install pkg-config

1. To fix problems with `mozjpeg`:

   brew install libpng sudo ln -s
   /opt/homebrew/Cellar/libpng/1.6.40/lib/libpng16.a /usr/local/lib/libpng16.a

You may need to adjust the path to `libpng16.a` depending on the version of
`libpng` you have installed.
