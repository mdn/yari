# Yari's CLI Tool

## Basic usage

Run the CLI tool:

```sh
yarn tool --help
```

### Or run the legacy version

```sh
yarn tool:legacy --help
```

## Commands

### add-redirect

Add a redirect to the `_redirects.txt`.

### delete

Delete a document (and optionally all children) by its slug. Optionally add an
redirect if deleting a single document. Also stages changes in `git` (except for
redirects).

### move

Move a document and its children. Adds the according redirects and stages
changes in `git` (except for redirects).

### sync-translated-content

Syncs translated content for all or a list of locales.

### fmt-sidebars

Formats all sidebars in content.

### sync-sidebars

Sync sidebars with redirects in content.

### fix-redirects

Fixes redirects across all locales.

### validate-redirect (only in legacy)

Validates the content of the `_redirects.txt` files(s). (This does not verify
that _to URLs_ exist)

### test-redirect (only in legacy)

Test whether an URL path is a redirect and display the according target.

### edit (only in legacy)

Open a document by its slug in the preferred editor (as per the `EDITOR`
environment variable).

### create (only in legacy)

Open a _new_ document by its slug in the preferred editor (as per the `EDITOR`
environment variable).

### validate (only in legacy)

Run basic validation for a document (only verifies the slug for now).

### preview (only in legacy)

Open a preview of a given slug in your browser. This depends on a running
dev-server (`yarn start`).

### flaws (only in legacy)

Show and optionally fix fixable flaws for a given slug.
