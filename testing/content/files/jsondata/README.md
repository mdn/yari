# About these files here...

The kumascript macros depend on various `.json` files. E.g.
`GroupData.json`. These files are actively maintained in the
[`mdn/content`](https://github.com/mdn/content) repo. It's a bit odd
that tests (functional and unit) depend on what's considered
"content". I.e. files from a different repo maintained by different
set of contributors. But much is similar of that with other files here
in Yari's `testing/content/files` directory which is meant to be a
somewhat controlled and static representation of what's in the real
`mdn/content` repo. Essentially, files in `testing/content/files` is a
"snapshot" of `mdn/content` but made specifically for benefit of
fixtures of test automation.

Every single `.json` file from
https://github.com/mdn/content/tree/main/files/jsondata is copied here
into this folder (where this README is) as of Aug 17, 2021. And that's
what the tests are using.

## Risks

There is a risk that the `.json` files in `mdn/content` change too
drastically such that the Yari `kumascript/macros/*.ejs` files that
depend on its structure cease to work. But that's a risk worth taking.

Macros rarely change but the `.json` files often do.
