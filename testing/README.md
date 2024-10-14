# Testing

There are many kinds of testing in Yari. Each one serving a different purpose.
We try to test things as far away from the implementation details as possible.
In particular, we always try to favor an end-to-end test instead of a unit test.

In this directory (`/testing/`) we have the `jest` tests,
[`playwright`](https://playwright.dev/) tests, and all the sample "fixture"
content we use for testing. There are actually some tests that test with real
content but mostly we try to control all the content that we test against.

## Functional tests

This is primarily to test the outcome of the Yari builder. You run
`npm run build` in a way so it builds based on the content here in `/testing/`
and then, using `jest`, we analyze the generated `index.json`, `index.html`, and
file attachments generated from that build.

To run these tests, first run:

```sh
export ENV_FILE=.env.testing
npm run build:prepare
npm run build:docs
npm run render:html
npm run start:static-server
```

This will start a server on <http://localhost:5042> which serves the built
content. Now, in a separate terminal, you can run:

```sh
npm run test:testing
```

The last command is just an alias for `jest` so you can run, for example:

```sh
# See jest help
npm run test:testing -- --help
# Interactive re-run every time a file is saved and exit on the first error
npm run test:testing -- --watch --bail
# Alias for searching by test file name. I.e. only run `index.test.js`
npm run test:testing index
```

## Headless tests

Headless tests are all about using a headless browser to browse the built HTML
files with `playwright`. It's based on the same steps as above, so first:

```sh
export ENV_FILE=.env.testing
npm run test:prepare
```

Now, to run the actual headless tests you run:

```sh
npm run test:headless
```

In CI automation it automatically picks up the browser binary according to the
setting `channel` in the file `/playwright.config.js`. For local development on
your laptop you might need to run:

```sh
npx playwright install chrome
```

(assuming `chrome` is what `channel` is set to in `playwright.config.js`)

### Debugging `playwright` tests

`playwright` has powerful debugging capabilities. Your best guide is the
[Debugging tools](https://playwright.dev/docs/debug) documentation. But here are
some quick tips to get you started.

```sh
# Just run the test by a test description string
npm run test:headless -- -g 'show your settings page'
# Make it NOT headless by making a browser pop up for each test
npm run test:headless -- --headed
# Exclusively run the tests in headless.sitesearch.spec.js only
playwright test headless.sitesearch
```

When you use `--headed` the browser will almost flash before your eyes and close
down before you get a chance to see what the browser is seeing. What you can do
is inject one line of `await page.pause();` anywhere inside the test code. Now,
next time you run, with `--headed`, a GUI should appear that pauses and allows
you to skip and resume tests.

## Headless tests of the development environment

There are two kinds of headless tests that _don't_ use the `/testing/content/`
and `/testing/translated-content/` fixtures. The first one is testing what Yari
developers would see. To run these you first need to run, in one terminal:

```sh
npm run dev
```

> NOTE: Ensure that you have `REACT_APP_WRITER_MODE` set to `true` in the `.env`
> at the root of the project before running `npm run dev`.

And in another terminal, run:

```sh
npm run test:developing
```

**Note!** To avoid "cross-contamination" with the other fixture-based headless
tests, when doing this start a fresh new terminal so that previously set
environment variables don't interfere.

The other kind of headless tests is those that test how Yari would work from the
perspective of using the packaged `@mdn/yari` from within the `mdn/content`
repository. To run these you need to go into your `mdn/content` repo and there
first run in one terminal:

```sh
cd /where/is/mdn/content
npm run start
```

Now, to run the tests in another terminal:

```sh
cd /back/to/mdn/yari
DEVELOPING_SKIP_DEV_URL=true npm run test:developing
```

**Note!** It's admittedly many permutations of testing and it's hard to remember
which is doing what. But as a tip, open the various files in
`.github/workflows/*.yml` and look through how they do it.

## Unit tests

There are currently 2 types of unit tests. The tests are located outside the
`/testing/` directory.

First to unit test some React components. This tests the
`client/src/**/*.test.tsx` files:

```sh
npm run test:client
```

Secondly, to unit test the `kumascript` tests. These tests are located in
`kumascript/tests/*.test.js`:

```sh
npm run test:kumascript
```

In both of these cases, it's `jest` so you can do things like adding
`--watch --bail` for example to interactively test over and over.

### Unit test deployer Python tests

See the file `deployer/README.md` for instructions.

## Local development for debugging tests

Going back to testing the content in `/testing/content/files/` and
`/testing/translated-content/files/` you might find it fiddly to see what you're
testing. The `--headed` flag to `npm run test:headless` is good but it's a bit
hard to see what you're getting to get around that you can do the following:

```sh
echo 'CONTENT_ROOT=testing/content/files' >> .env
echo 'CONTENT_TRANSLATED_ROOT=testing/translated-content/files' >> .env
npm run dev
```

Now you can browse both <http://localhost:3000> and <http://localhost:5042> to
see what the content fixtures are. For example, you can go to
<http://localhost:3000/en-US/docs/Web/Foo>. Again, remember to start with a
fresh new terminal so that no other testing related environment variables. And
remember to undo these changes from your personal `.env` when you're done.
