# NPM Package

## Relationship between Yari and Content

When you're working on just the [content](https://github.com/mdn/content) you
don't need all the things of Yari. For example, you don't need the
`create-react-app` front-end dev server on `localhost:3000`. You also don't need
all the things Yari needs for running automated tests.

So, we package up Yari as an NPM tarball, released to
[npmjs.com as `@mdn/yari`](https://www.npmjs.com/package/@mdn/yari) and that's
what Content depends on. This package should contain everything you need to
start a server that contains all the editing and previewing features, plus the
ability to Yari build a document to its final `index.html` form.

In Yari, a
[GitHub Action](https://github.com/mdn/yari/blob/main/.github/workflows/npm-publish.yml)
runs on every commit to `main` and that creates
[a `git` tag](https://github.com/mdn/yari/tags) and a tarball release on
npmjs.com.

## As slim as possible

The general idea is that the npm tarball can and should be as small as possible.
This is based on the fact that it should only contain what's actually needed to
use Yari from the Content repo to do your previewing and other various "CRUD"
(Create, Read, Update, Delete) tools.

To accomplish this, you use the `.npmignore` to control which files don't get
included in the tarball. For example, source code that isn't needed once the
builds/dists have been made.

You can always investigate what gets included in the tarball by running, at any
time, this:

    cat .git/info/exclude >> .npmignore
    npm pack --dry-run
    git checkout .npmignore

Or, you can omit the `--dry-run`, let it create a `mdn-yari-0.x.y.tgz` which you
can extract into your `/tmp/` directory and manually inspect the files in there.

But note, it's not just about what's included in the tarball. What also matters
is what happens when someone installs the tarball. Because the tarball contains
a `package.json` and consecuent `npm install` will start to download those
dependencies too.

In Yari, any dependency that you don't need in Content, but you need in Yari
should go into the `devDependencies` (rather than `dependencies`) in the
`package.json`. For example, things that are used to for automated testing of
Yari:

    npm add -D jest-environment-jsdom-sixteen

## Debugging the tarball

There might be easier ways to do this, but this works. Suppose you have two
directories: `~/yari` and `~/content`. And you want to know if some edit to the
`package.json` would work when shipped.

First of all, make you relevant edits in `~/yari` then run:

    export REACT_APP_DISABLE_AUTH=true
    export REACT_APP_CRUD_MODE=true
    npm run build:prepare
    echo .git/info/exclude >> .npmignore
    echo .env >> .npmignore
    npm pack

This is essentially what the `npm-publish.yml` workflow does in a GitHub Action,
with the only difference that you use `npm pack` instead of `npm publish`. This
will produce a `mdn-yari-x.y.z.tgz` file on your disk.

Now, go to `~/content` and run:

    rm -fr node_modules
    npm run add ~/yari/mdn-yari-x.y.z.tgz
    npm run start
    open http://localhost:5042

Make sure you actually test it out fully. For example, just because
`npm run start` starts the server OK, doesn't mean it can do all things it needs
to do. The best place to start is to navigate into <http://localhost:5042> to an
actual page which will need to built-on-the-fly.
