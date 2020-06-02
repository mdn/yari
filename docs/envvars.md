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
CLI arguments. And

The general rule is that environment variables specific to the builder are
all prefixed with `BUILD_`. E.g. `BUILD_LOCALES`

### `BUILD_ROOT`

**Default: `content/files`**

Where the files are.

### `BUILD_DESTINATION`

**Default: `client/build`**

Where the built `index.html` and `index.json` files go.

### `BUILD_POPULARITIES_FILEPATH`

**Default: `content/popularities.json`**

It's the location to a .json file that has popularities based on
Google Analytics pageviews numbers.

### `BUILD_ALLOW_STALE_TITLES`

**Default: `false`**

When you build, it needs to first generate a complete map of all documents
with their URI as the keys. That map gets cached to disk as
`content/_all-titles.json` and within there's a `hash` key which tells
what digest of the code that it was built with. If the code (or
things like `package.json` or `yarn.lock`) changes, this invalidates
the stored file.
Generating this can be time-consuming if you're doing rapid development.

Setting this environment variable to `true` means it simply cares if
the file exists or not independent of the hash digest.

### `BUILD_LOCALES`

**Default: `[]`** (meaning, all)

**Example: `en-us,fr`**

**Note** It's a comma separated string.

Limits which locales to build when not specifying a specific folder or a
specific locale. Can be useful when you often build large batches but
only care about these specific locales.

In the CLI you can override this with `-l ...` or `--locales=...`.

### `BUILD_NOT_LOCALES`

**Default: `[]`** (meaning, none)

Same logic as `BUILD_LOCALES` except the opposite.
Comes in handy if you want to keep building most locales but have a handful
you specifically don't care about.

In the CLI you can override this with `--not-locales=...`.

### `BUILD_FOLDER_SEARCHES`

**Default: `[]`** (meaning, none)

**Example: `web/css,web/html`**

Applicable if you run batches of builds but want to limit it to only the
folders you care about.
When doing a batch build, it can be very time-consuming so just doing
one or two sub-folders will speed things up.

### `BUILD_ARCHIVE_ROOT`

**Default: `null`** (meaning, not set nor included)

If you want to build archive content (no KumaScript rendering) you
can say where the location to the folder is.

**Example: `/tmp/mdn-archive-content`**

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

### `BUILD_LIVE_SAMPLES_BASE_URL`

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
