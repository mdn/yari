# dumper

This code is a bit rough but it's ultimately just meant to be used one
single time in its life existence. Once we've run it and checked it in
and moved on with our post-Wiki life, we can burn this.

## import

Takes all the MySQL content and splits it into 3 buckets:

1. Archive content (goes into `CONTENT_ARCHIVED_ROOT`) independent of locale.
1. Active (non-archive) English content (goes into `CONTENT_ROOT`)
1. All other non-English content (goes into `CONTENT_TRANSLATED_ROOT`)

You have to set `CONTENT_ROOT` and `CONTENT_ARCHIVED_ROOT` and
`CONTENT_TRANSLATED_ROOT`. If they don't already exist, they will be
created.

```bash
cd import
export CONTENT_ROOT=/Users/peterbe/dev/MOZILLA/MDN/content/files
export CONTENT_ARCHIVED_ROOT=/Users/peterbe/dev/MOZILLA/MDN/archived-content/files
export CONTENT_TRANSLATED_ROOT=/Users/peterbe/dev/MOZILLA/MDN/translated-content/files
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
