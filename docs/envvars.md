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
