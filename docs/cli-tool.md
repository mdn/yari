# Yari's CLI Tool

## Basic usage

Install dependencies:

```
$ yarn
```

Run the CLI tool:

```
$ yarn tool --help

  cli.js 0.0.0

  USAGE

    ▸ cli.js <command> [ARGUMENTS...] [OPTIONS...]


  COMMANDS — Type 'cli.js help <command>' to get some help about a command

    validate-redirect                    Check the _redirects.txt file(s)
    test-redirect                        Test a URL (pathname) to see if it redirects
    add-redirect                         Add a new redirect
    delete                               Delete content
    move                                 Move content to a new slug
    edit                                 Spawn your EDITOR for an existing slug
    create                               Spawn your Editor for a new slug
    validate                             Validate a document
    preview                              Open a preview of a slug

  GLOBAL OPTIONS

    -h, --help                           Display global help or command-related help.
    -V, --version                        Display version.
    --no-color                           Disable use of colors in output.
    -v, --verbose                        Verbose mode: will also output debug messages.
    --quiet                              Quiet mode - only displays warn and error messages.
```

### validate-redirect

Validates the content of the `_redirects.txt` files(s). (This does not verify that _to URLs_ exist)

### test-redirect

Test whether an URL path is a redirect and display the according target.

### add-redirect

Add a redirect to the `_redirects.txt`.

### delete

Delete a document (and optionally all children) by its slug. Optionally add an redirect if deleting a single document.
Also stages changes in git (except for redirects).

### move

Move a document and its children. Adds the according redirects and stages changes in git (except for redirects).

### edit

Open a document by its slug in the preferred editor (as per the EDITOR environment variable).

### crate

Open a new document by its slug in the preferred editor (as per the EDITOR environment variable).

### validate

Run basic validation for a document (only verifies the slug for now).

### preview

Spawn a preview of a given slug in your browser. This depends on a running dev-server (`yarn start`).
