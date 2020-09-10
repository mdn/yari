# dumper

This code is a bit rough but it's ultimately just meant to be used one
single time in its life existence. Once we've run it and checked it in
and moved on with our post-Wiki life, we can burn this.

## Example run

You can set `CONTENT_ROOT` and `CONTENT_ARCHIVE_ROOT` to any folder
but it's **important that directories exists** otherwise Yari will
assume you're referring to relative folders.

```bash
cd import
export CONTENT_ROOT=/Users/peterbe/dev/MOZILLA/MDN/content/files
export CONTENT_ARCHIVE_ROOT=/Users/peterbe/dev/MOZILLA/MDN/archivecontent/files
node cli.js
```
