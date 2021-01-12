# Deployer

The Yari deployer does two things. First, it's used to upload document
redirects, pre-built document pages, static files (e.g. JS, CSS, and
image files), and sitemap files into an existing AWS S3 bucket. Since
we serve MDN document pages from an S3 bucket via a CloudFront CDN,
this is the way we upload a new version of the site.

Second, it is used to update and publish changes to existing AWS Lambda
functions. For example, we use it to update and publish new versions of
a Lambda function that we use to transform incoming document URL's into
their corresponding S3 keys.

## Getting started

You can install it globally or in a virtualenv environment. Whichever you
prefer.

```sh
cd deployer
poetry install
poetry run deployer --help
```

Please refer to the [`boto3` documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration)
with regards to configuring AWS access credentials.

## Uploads

The `poetry run deployer upload DIRECTORY` command uploads files as well as redirects
into an existing S3 bucket. Currently, we have three main S3 buckets that we
upload into: `mdn-content-dev` (for variations or experimental versions of
the site), `mdn-content-stage`, and `mdn-content-prod`.

As input, the `upload` command takes a directory which
contains the files that should be uploaded, but it needs to know where to
find any redirects that should be uploaded as well. By default it searches
for redirects within the content directories specified by `--content-root`
(or `CONTENT_ROOT`) and `--content-translated-root` (or `CONTENT_TRANSLATED_ROOT`).
It does this by searching for `_redirects.txt` files within those directories,
converting each line in a `_redirects.txt` file into an S3 redirect object.
The files and redirects are uploaded into a sub-folder (a.k.a. `prefix`) of the
S3 bucket's root. The prefix (`--prefix` option) defaults to `main`, which is
most likely what you'll want for uploads to the `mdn-content-stage` and
`mdn-content-prod` S3 buckets. However, for uploads to the `mdn-content-dev`
bucket, the prefix is often used to specify a different folder for each
variation of the site that is being reviewed/considered.

When uploading files (not redirects), the deployer is intelligent about
what it uploads. If only uploads files whose content has changed, skipping
the rest. However, since the `cache-control` attribute of a file is not
considered part of its content, if you'd like to change the `cache-control`
from what's in S3, it's important to use the `--force-refresh` option to
ensure that all files are uploaded with fresh `cache-control` attributes.

Redirects are always uploaded.

### Examples

```sh
export CONTENT_ROOT=/path/to/content/files
export CONTENT_TRANSLATED_ROOT=/path/to/translated-content/files
cd deployer
poetry run deployer upload --bucket mdn-content-dev --prefix pr1234 ../client/build
```

```sh
export CONTENT_ROOT=/path/to/content/files
export CONTENT_TRANSLATED_ROOT=/path/to/translated-content/files
export DEPLOYER_BUCKET_NAME=mdn-content-dev
export DEPLOYER_BUCKET_PREFIX=pr1234
cd deployer
poetry run deployer upload ../client/build
```

## Updating Lambda Functions

The command:

```sh
cd deployer
poetry run deployer update-lambda-functions
```

will discover every folder that contains a Lambda function, create a
deployment package (Zip file) for each one by running:

```sh
yarn make-package
```

and if the deployment package is different from what is already in AWS,
it will upload and publish a new version.

## Elasticsearch indexing

You just need a URL (or host name) for an Elasticsearch server and the
root of the build directory. The command will trawl all `index.json` files
and extract all metadata and blocks of prose which gets HTML stripped.
The command is:

```sh
cd deployer
poetry run deployer search-index --help
```

If you have built the whole site (or partially) you simply point to
it with the first argument:

```sh
poetry run deployer search-index ../client/build
```

But by default, it does not specify the Elasticsearch URL/host. You can
either use:

```sh
export ELASTICSEARCH_URL=http://localhost:9200
poetry run deployer search-index ../client/build
```

...or...

```sh
poetry run deployer search-index ../client/build --url http://localhost:9200
```

**Note!** If you don't specify either the environment variable or the `--url`
option, the script will _not_ fail (ie. exit non-zero).
This is to make it convenient in GitHub Actions to control the
execution purely based on the presence of the
environment variable.

### To update or not start a fresh

The default behavior is that it deletes the index first and immediately creates
it again. You can switch this off by using the `--update` option. Then it
will "cake on" the documents. So if something has been deleted since the last
build, you would still have that "stuck" in Elasticsearch.

Deleting and re-creating the index is fast so it's relatively safe to use often.
But the indexing can take many seconds and while indexing, Elasticsearch
can only search what's been indexed so far.

An interesting pattern would be to use `--update` most of the time and
only from time to time omit it for a fresh new start.

But note, if you omit the `--update` (i.e. recreating the index), search
will work. It just may find less that it finds when it's fully indexed.

### Priority prefixes

When you index without `--update` it will delete and recreate the index.
That means that during the time you're indexing, the searches that are happening
concurrently will not find much. That's probably OK in most cases but you
can adjust the priority of what gets indexed first. This has the advantage
that most searches, that are expecting to find content in the popular document,
will get something useful while the indexing is going on.

To set up one or multiple priority prefixes use the `--priority-prefixes`
(or just `-p` for short). Best described with an example:

```sh
poetry run deployer search-index ../client/build -p en-us/docs/web -p en-us/docs
```

This will first index all the files whose `index.json` file path (relative
to the root) matches `en-us/docs/web`. Then it does all that match `en-us/docs`.
And lastly, it does all the files that don't match any of the prefixes.

## Environment variables

The following environment variables are supported.

- `DEPLOYER_BUCKET_NAME` is equivalent to using `--bucket` (the
  default is `mdn-content-dev`)
- `DEPLOYER_BUCKET_PREFIX` is equivalent to using `--prefix` (the
  default is `main`)
- `DEPLOYER_NO_PROGRESSBAR` is equivalent to using `--no-progressbar`
  (the default is `true` if not run from a terminal or the `CI`
  environment variable is `true` like it is for GitHub Actions,
  otherwise the default is `false`)
- `DEPLOYER_CACHE_CONTROL` can be used to specify the `cache-control`
  header for all non-hashed files that are uploaded (the default is
  `3600` or one hour)
- `DEPLOYER_HASHED_CACHE_CONTROL` can be used to specify the `cache-control`
  header for all hashed files (e.g., `main.3c12da89.chunk.js`) that are
  uploaded (the default is `31536000` or one year)
- `DEPLOYER_MAX_WORKERS_PARALLEL_UPLOADS` controls the number of worker
  threads used when uploading (the default is `50`)
- `DEPLOYER_LOG_EACH_SUCCESSFUL_UPLOAD` will print successful upload
  tasks to `stdout`. The default is that this is `False`.
- `CONTENT_ROOT` is equivalent to using `--content-root` (there is no
  default)
- `CONTENT_TRANSLATED_ROOT` is equivalent to using `--content-translated-root`
  (there is no default)
- `ELASTICSEARCH_URL` used by the `search-index` command.

## Contributing

You need to have [`poetry` installed on your system](https://python-poetry.org/docs/).
Now run:

```sh
cd deployer
poetry install
```

That should have installed the CLI:

```sh
poetry run deployer
```

If you wanna make a PR, make sure it's formatted with `black` and
passes `flake8`.

You can check that all files are `flake8` fine by running:

```sh
flake8 deployer
```

And to check that all files are formatted according to `black` run:

```sh
black --check deployer
```
