# Yari content scripts

Below is an overview of each important script that works with the content.

## `build`

Probably the most important script because it turns the raw content into
`index.json` files (for each document) that can be rendered to ready and
finished `index.html` files. You execute it like this:

    node content build --help
    node content build  # build everything
    node content build -l fr -l en-US -f Web -s CSS --no-cache  # example options

The basic patterns is that it picks up files from `content/files/**/index.html`
(combined with `content/files/**/index.yaml`) and converts the raw HTML into
rendered HTML and packages that up into a format that the renderer requires.
The format is pretty simple but it's generally like this example:

```json
{
  "sidebarHTML": "<ol>\n   \n            <li>....",
  "title": "<datalist>: The HTML Data List element",
  "mdn_url": "/en-US/docs/Web/HTML/Element/datalist",
  "body": [
    {
      "type": "prose",
      "value": {
        "id": null,
        "title": null,
        "content": "<div></div>\n\n<p>..."
      }
    },
    {
      "type": "browser_compatibility",
      "value": {
        "title": "Browser compatibility",
        "id": "Browser_compatibility",
        "data": {
          "__compat": {...}
        }
      }
    },
    {
      "type": "prose",
      "value": {
        "id": "Polyfill",
        "title": "Polyfill",
        "content": "<p>Include ..."
      }
    },
    {
      "type": "prose",
      "value": {
        "id": "See_also",
        "title": "See also",
        "content": "<ul>\n <li>The ..."
      }
    }
  ],
  "popularity": 0,
  "last_modified": "2019-11-26T11:31:11.202Z"
}
```

The rendered HTML, after running `KumaScript` is essentially split by the
`<h2>` tags and for each "section" it tries to be clever. And if it can't
be clever it just treats it as a block of "prose" with the full HTML as is.
One example of cleverness is turning a rendered "Browser Compatibility"
HTML table into the raw data directly from the `mdn-browser-compat-data`
third-party dependency.

### Thread-safety

The build script is only guaranteed to be safe to run across multiple
processes if split by locale. For example, if you run, in two different
terminals:

    # Terminal 1
    node content build -l en-US

    # Terminal 2
    node content build -l en-US

...you're looking for trouble :)

But you can, and is encouraged to do something like this:

    # Terminal 1
    node content build -l en-US

    # Terminal 2
    node content build -l fr -l ja

### Caching

By default, the inputs to the actual inner core of processing is recorded and
hashed to disk. That means that for every built `index.json` there's also
a `index.hash` which might look like this:

    ▶ cat content/build/en-US/Web/CSS/Specificity/index.hash
    e7818e31d083.fe92ed979786

That hash digest is `<scripts>.<inputfiles>`. This means that the hash
is partly made up of the current has of `package.json` and all the
`scripts/*.js` files. So if a new package is upgrade or the source code
to the build script is edited, the hash will always lead to a cache miss.
The second part is the hash digest of the content of each folder's
`index.html` and `index.yaml` content.

You can force cache misses for all documents with the `--no-cache` option.

### Filtering

The most important filtering is the locale. E.g.

    node content build -l fr -l ja

will only build the files in `content/files/fr/` and `content/files/ja/`.

On top of that you can also filter by folder and/or by slug. The matching
is accumulative meaning if you run:

    node content build -f Web -f HTTP -s foo -s ab/cd

...it means it will only look into folder names that contain the
string `Web` **or** the string `HTTP`. And on top of that it will only look
for documents whose slug contains the string `foo` **or** `ab/cd`. In SQL
terms it would be:

```sql
WHERE
    (folder LIKE '%Web%' OR folder LIKE '%HTTP%')
    AND (slug LIKE '%foo%' OR slug LIKE '%ab/cd%')
```

If you're only interested in French and English (US) for example, it might
get tedius to have to type `-l fr -l en-US` every time. In that case you
can put `BUILD_LOCALES=fr,en-US` in your `.env` file.

### Google Analytics popularities

If you supply an exported Google Analytics CSV file, it wll be parsed, and
incorporated in the build process so that every produced `index.json` will
a floating point number called `popularity`. How to generate a CSV file
from Google Analytics of all pageviews is not documented here but if you have
a file on disk you can use it like this:

    node content build -l en-US --googleanalytics-pageviews-csv ~/tmp/Pages.csv

This will be important for the eventual rendering as its search can find
things more conveniently be listing them in order of popularity.

## `import`

To be continued. The `import` command is primarily for the core team only
and is designed to only last a short while.
