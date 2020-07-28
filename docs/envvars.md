# Environment Variables

Most things can be controlled via environment variables. Some things are
specific to the client and some are specific to the builder etc.

This document attempts to describe each environment variable.

## General

### `EDITOR`

#### Default: n/a

This is a general OS, optional, environment variable and it's needed
if you want the ability to go from viewing a rendered document to
opening the source in your preferred editor. It's needed for the
"Edit this page in your editor" button to work.

## Builder

For the builder, a lot of environment variables can be overridden with
CLI arguments.

The general rule is that environment variables specific to the builder are
all prefixed with `CONTENT_`. E.g. `CONTENT_ROOT`

### `CONTENT_ROOT`

**Default: `content/files`**

Where the files are.

### `CONTENT_ARCHIVE_ROOT`

**Default: `null`** (meaning, not set nor included)

If you want to build archive content (no KumaScript rendering) you
can say where the location to the folder is.

**Example: `/tmp/mdn-archive-content`**

### `BUILD_FOLDERSEARCH`

**Default: ``** (meaning, none)

**Example: `web/css,web/html`**

Applicable if you run batches of builds but want to limit it to only the
folders you care about.
When doing a batch build, it can be very time-consuming so just doing
one or two sub-folders will speed things up.

### `BUILD_OUT_ROOT`

**Default: `client/build`**

Location into which things should be built.

### `BUILD_FLAW_LEVELS`

**Default: `*:warn`**

To set this you need to know what all the possible flaw identifiers are called.
The complete set can be found in `content/src/constants.js` in
`VALID_FLAW_CHECKS`. And the level values are `error`, `warn`, or `ignore`.

The value of this environment variable is a comma separated string. Any
identifier or level value that is not recognized will throw an error.

You can mix and match like this for example:

```sh
macros:error, broken_links: warn, bad_bcd_queries: ignore
```

Anything _not_ mentioned defaults to `ignore`, so the above example
is equivalent to:

```sh
macros:error, broken_links: warn
```

When a flaw is discovered, if the level is `error` it will, halt the build
and throw an error. It will halt on the first flaw error encountered.
If the level is `warn` it will inject the flaw message into the built
`index.json` file which you can view when rendering the document on
`http://localhost:3000/`.

### `BUILD_FIX_FLAWS`

**Default: `false`**

Whether fixable flaws should be fixed when building documents.

### `BUILD_FIX_FLAWS_DRY_RUN`

**Default: `false`**

When set to true (with the `BUILD_FIX_FLAWS` flag) it will only print out
information about fixable flaws instead of actually fixing it on disk.

### `BUILD_FIX_FLAWS_VERBOSE`

**Default: `false`**

### `KS_LIVE_SAMPLES_BASE_URL`

**Default: `https://mdn.mozillademos.org`**

When generating live samples `<iframe>` tags, the `src` attribute gets this
set as a prefix. The ultimate reason why it's meant to be different is
because the security of the `iframe`'s content has not been audited as
carefully as the rest of the site.

When doing local development, it's recommended to set this to
`http://localhost:5000` in your personal `.env`.

## Server

### `SERVER_PORT`

**Default: `5000`**

Usually the `server` workspace is started with `foreman` (the `nf` command)
and this is the default port.

## Testing

### `TESTING_OPEN_BROWSER`

**Default: `false`**

When running the `jest-puppeteer` test suites, if you set this to `true`,
it will open a browser on every page navigation.

It might just flash by too quickly, so consider putting in
`await jestPuppeteer.debug()` inside the test function to slow it down.

### `TESTING_START_SERVER`

**Default: `false`**

When `jest-puppeteer` starts the `jest` tests, if this variable is set
to `true` it will execute `node ../server/index.js` to start the `server`
on `localhost:5000`.

In most cases, on your laptop it's better to start the server yourself
in a separate terminal and then run the headless tests in another.

For more information, see the `testing/README.md`.
