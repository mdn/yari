# stumptown-renderer

[![Build Status](https://travis-ci.org/mdn/stumptown-renderer.svg?branch=master)](https://travis-ci.org/mdn/stumptown-renderer)

## Quickstart

These steps should get you started, locally, straight away:

    git clone --recursive https://github.com/mdn/stumptown-renderer.git
    cd stumptown-renderer
    yarn
    yarn start
    open http://localhost:3000

To really understand how it starts and how to break down the various
tools, open `Procfile` or the `package.json`. Or, read on...

## Overview

[stumptown-content](https://github.com/mdn/stumptown-content) is a
couple of things:

1. **It's the source of truth.** The content comes in the form of `.md` files and
   associated `.yaml` files that supplies the required metadata. These files
   are what's expected to be edited, with pull requests, by people who want to
   improve the content.

2. **Recipe definitions.** It's a bit like a template if you like. Each section
   of content is broken up into pieces, by keys, such as `prose.short_description`.
   What the recipes do is they dictate how these pieces are supposed to be put
   together in a final block of HTML.

3. **Scripts** that convert `.md` files (with their respective `.yaml` file)
   into blocks of HTML strings. These are put into `.json` files keyed by the
   pieces for each content page. Once transformed from `.md` to `.json`,
   together with the recipe, you can construct a final block of HTML

What *this* project does is;

**From content in stumptown, produce HTML using React components.**

But this project also attempts to make those pages ready for viewing
in a browser. It uses `create-react-app` to define a HTML template and
the React components within are used in two different ways:

1. You execute the command line program to produce ready-to-statically-serve
   `.html` files that can be opened without an application server. (e.g. Nginx
   or Netlify)

2. All the React components that are used by the cli are usable in the
   browser too. For every produced `<page>/index.html` file there's also
   a `<page>/index.json` which contains all the information to be able to
   render it client-side after an XHR request gathers the information.

## Installing

If you haven't already done so, run:

    cd where/you/want/to/clone/it
    git clone --recursive https://github.com/mdn/stumptown-renderer.git
    cd stumptown-renderer

You need a decent version of `node` (>= 10.11.0), `yarn`, and `npm`.

After you have cloned the repo and want to pull in upstream changes run:

    git pull origin master
    git submodule update

## Development

To do local development, there are many services to start. The simplest
is to use `nf` which is a dev dependency that gets installed by the
root `package.json` and executed like this:

    yarn
    yarn start

That will start a React dev-server at `http://localhost:3000`. If you
change any of them files in `client/src` it will reload and refresh your
browser. If you edit any of the Markdown files in `stumptown` it will
repackage that file and refresh your browser too.

Note! We hope to use, as an alternative to `nf`, `docker-compose`.
See [https://github.com/mdn/stumptown-renderer/issues/23](https://github.com/mdn/stumptown-renderer/issues/23)
But even then, using `docker-compose` should and will be optional.

## Contributing

Open two terminals. In one, run (this will take a little time the first time):

    yarn workspace server start

In another terminal:

    yarn workspace client start

Now you should have two servers:

1. [http://localhost:3000](http://localhost:3000) (open this in your browser)

2. [http://localhost:5000](http://localhost:5000)

Note that when you run the `React` dev server (on `localhost:3000`) it
depends on the files built by `stumptown` and consequently built by
the `cli`. You can now hack on the key `React` components and just refresh
the browser to see the effect immediately. If you want re-build the
content made available to the `React` components, open another terminal
and run:

    yarn build

To re-run any of the installation and build steps you can, at any time,
run:

    yarn

## Building

The beauty of `package.json` is that it's a recorded "snapshot" of some good
working default commands. If you're trying to do something slightly different,
such as hacking on some feature, you can open the `package.json` and take
*inspriation* from it rather than thinking it's the only way. So, open
it and learn how the default commands work.

### Deployment Build
For example, the most important command beyond the active development one
mentioned in the section above is:

    yarn deployment-build

That one does "everything" and you end up with a full directory that has
all the static bundles of JavaScript, CSS, and the .html files. That directory
can be shipped to a static hosting platform like AWS S3 for example.

Note that as part of `yarn start` it also starts up a plain HTTP server on
`http://localhost:5000` which simply serves the generates static assets and the
the `.html` files.

### Building a specific file
To build a page based on an existing content JSON, you need to run the cli with
a relative path to the content.

    cd cli
    yarn start ../stumptown/packaged/html/HTML.json

### Specifying a different content directory
If you're actively working on a piece of content in `stumptown-content` but
for convenience you don't want to mess with the `stumptown-content` that
is available here in this project as a *git submodule* (named `stumptown`),
then you can set the `STUMPTOWN_CONTENT_ROOT` environment variable.
For example:

    cd ~/projects/stumptown-renderer
    # running 'yarn build' now would use ~/projects/stumptown-renderer/stumptown
    yarn cross-env STUMPTOWN_CONTENT_ROOT=~/stumptown-content yarn build
    # or
    yarn cross-env STUMPTOWN_CONTENT_ROOT=~/stumptown-content yarn deployment-build

### Security Auditing

To check that all node modules are up to date to secure versions you can run

    yarn audit

It will execute `yarn audit` in each sub-package. To remedy
`yarn` auditing warnings, refer to the official `yarn` documentation.

### Linting (formatting)

Linting is done with Prettier. It's checked in CI but also installed as a
git hook. The configuration (i.e. our choices) are deliberately omitted
which means it applies all the *default choices* from
[stock Prettier](https://prettier.io/docs/en/options.html). For example,
line width 80, 2 spaces indentation, semicolon strings, single quotes,
no trailing commas, etc.

To check *all* files once run:

    yarn prettier-check

To only check the files you have touched in the current git stage:

    yarn pretty-quick --branch master

Note this command **does not complain, it fixes**. Meaning, if you make an edit to a `.js` file and accidentally violate the Prettier rules, simply running this will *fix* the violation. For example:

    emacs client/src/app.js
    yarn pretty-quick --branch master

And if you just want to format all existing files (might be useful after
you've run `yarn upgrade prettier --latest` for example):

    yarn prettier-format

## Server-Sider Rendering

Usually, when doing local development work you don't need server-side
rendering. But it's a luxury to have for these reasons:

1. It's faster for the sake of SEO and will work in any non-JavaScript
   enabled browser.

2. When all possible URLs are pre-generated and uploaded as static files
   you don't need a clever server that knows to "reroute" all (non-static) URLs to
   `/index.html`.

3. If you can, with the `cli`, generate every single possible file ready for
   static serving there's an opportunity to do expensive post-processing such
   as extracting critical CSS or calculating nonce for CSP headers.

## Deployment

Deployment means that you prepare one whole single directory that is
all that is needed. This build directory is ready to ship to wherever you
host your static site. Build everything with:

    yarn deployment-build

What it does is a mix of `yarn workspace server start` and
`yarn workspace client start` but without starting a server. It also,
builds a `index.html` file for every document found and processed by the
`cli`. This whole directory is ready to be uploaded to S3 or Netlify.

## Goals and Not-Goals

Number one goal right now: **Being able to turn a stumptown content into
a HTML block that you can view in a browser.**

Another useful goal is that building HTML pages is the ultimate litmus
test to check that the whole chain works. If a pull request is made against
`content/html/properties/video/prose.md` you should be able to render that.
If the rendering fails, it's most likely due to a serious problem in the
the `prose.md` (or the `meta.yaml`) file.

It's not a goal to slot this perfectly into `kuma`. First and foremost
the React components, that takes the `.json` from stumptown's packaging,
can produce a valid DOM as a string.

It's not a goal to have every feature that `kuma` has.

## Nice To Haves

In principle since every piece of content (transformed) is available
it can be used to feed a graph so that we can have automatic relevant
links. E.g. the `html/content/properties/video/` should know that
`html/content/properties/canvas/` is available and within the same reach.

Also, we can use the content to feed a full-text search engine. Be that
Elasticsearch or FlexSearch it will need a dynamic server which
we don't yet have.

At the moment, a cli produces the fully viewable `index.html` files.
This has advantages that we can prepare every single page in something
like a deployment script or a build step in CI. But we could also start
a Node ExpressJS server and do the same thing there. The URL is the input
instead of the file path on disk.

## Upgrading Packages

First, to find out which applications have out-of-date packages, run:

    ./bin/yarn-outdated-all.sh

It won't stop if any one app has outdated packages. It will go through
all of them. Suppose that it mentions outdated packages, go into the app
folder and run something like this:

    cd cli
    yarn outdated  # optional if you already know from ./bin/yarn-outdated-all.sh
    yarn upgrade webpack --latest

### Upgrading React

React is used in at least two places; the `client` and the `cli`. It's
important that both of these project folders have the same version of React
so that server-side rendering and client-side rendering have matching version.

Also, `react` and `react-dom` should be upgraded at the same time since they
share release cycles. To help with all of this, run:

    ./bin/yarn-upgrade-all-reacts.sh

## Icons and logos

The various formats and sizes of the favicon is generated
from the file `mdn-web-docs.svg` in the repository root. This file is then
converted to favicons using [realfavicongenerator.net](https://realfavicongenerator.net/).
To generate new favicons, edit or replace the `mdn-web-docs.svg` file
and then re-upload that to realfavicongenerator.net.
