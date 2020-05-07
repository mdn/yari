# Environment Variables

Most things can be controlled via environment variables. Some things are
specific to the client and some are specific to the builder etc.

This document attempts to describe each environment variable.

## Builder

For the builder, a lot of environment variables can be overridden with
CLI arguments. And

The general rule is that environment variables specific to the builder are
all prefixed with `BUILD_`. E.g. `BUILD_LOCALES`

### `BUILD_IGNORE_TITLES_CACHE`

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
