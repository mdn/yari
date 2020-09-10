# dumper

This code is a bit rough but it's ultimately just meant to be used one
single time in its life existence. Once we've run it and checked it in
and moved on with our post-Wiki life, we can burn this.

## import

You can set `CONTENT_ROOT` and `CONTENT_ARCHIVE_ROOT` to any folder
but **it's important that directories exists** otherwise Yari will
assume you're referring to relative folders.

```bash
cd import
export CONTENT_ROOT=/Users/peterbe/dev/MOZILLA/MDN/content/files
export CONTENT_ARCHIVE_ROOT=/Users/peterbe/dev/MOZILLA/MDN/archivecontent/files
node cli.js import
```

## makepopularities

This command transforms a Google Analytics pages CSV report into a JSON
file.

```bash
cd import
node cli makepopularities /path/to/huge/Pages.csv
```

This should create a `./popularities.json` file.

Or, you can filter down to specific locales only:

```bash
cd import
node cli makepopularities -l en-us /path/to/huge/Pages.csv
```

Or change where it to put the file:

```bash
cd import
node cli makepopularities -o /tmp/pops.json /path/to/huge/Pages.csv
```
