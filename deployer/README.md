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
and extract all metadata and blocks of prose which get their HTML stripped.
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
export DEPLOYER_ELASTICSEARCH_URL=http://localhost:9200
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

### About Elasticsearch aliases

The default behavior is that each day you get a different index name.
E.g. `mdn_docs_20210331093714`. And then there's an alias with a more "generic" name.
E.g. `mdn_docs`. It's the alias name that Kuma uses to send search queries to.

The way indexing works is that we leave the existing index and its alias in place,
then we fill up a new index and once that works, we atomically "move the alias" and
delete the old index. To demonstrate, consider this example timeline:

- Yesterday: index `mdn_docs_20210330093714` and `mdn_docs --> mdn_docs_20210330093714`
- Today:
  - create new index `mdn_docs_20210331094500`
  - populate `mdn_docs_20210331094500` (could take a long time)
  - atomically re-assign alias `mdn_docs --> mdn_docs_20210331094500` and delete old index `mdn_docs_20210330093714`
  - delete old index `mdn_docs_20210330`

Note, this only applies if you _don't_ use `--update`.
If you use `--update` it will just keep adding to the existing index whose
name is based on today's date.

What this means it that **there is zero downtime for the search queries**. Nothing
needs to be reconfigured on the Kuma side.

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

## Analyze PR builds

When you've built files you can analyze those built files to produce a Markdown
comment that you can post as a PR issue comment. To do that, run:

```sh
poetry run deployer analyze-pr-build ../client/build
```

But the actions are controlled by various options. You can mix and match these:

### `--analyze-flaws`

This will open each built `index.json` and look through the `.flaws` and try to
convert each flaw into a list.

### `--analyze-dangerous-content`

It will analyze all the content and look for content that could be "dangerous".
For example, it will list all external URLs found in the content.

### `--prefix`

The `prefix` refers to a prefix in the Deployer upload. I.e. what you set when
you run `poetry run deployer upload --prefix=THIS`.
The `prefix` is used to specify the proper Dev subdomain (`{prefix}.content.dev.mdn.mozit.cloud`) for the URLs of the built documents. For example,
if `--prefix experiment1` is specified, it will list:

```md
## Preview URLs

- <https://experiment1.content.dev.mdn.mozit.cloud/en-US/docs/MDN/Kitchensink>
```

...assuming the only page that was built was `build/en-us/docs/mdn/kitchensink`.
Note that this assumes the PR build has been deployed to the Dev server.

### `--repo`

This is useful for debugging when the PR you made wasn't on `mdn/content`. For example:

```sh
poetry run deployer analyze-pr-build ../client/build --repo peterbe/content ...
```

### `--github-token`

By default it will pick up the `$GITHUB_TOKEN` environment variable but with this
option you can override it.

### `--pr-number`

This is needed to be able to find the PR (on <https://github.com/mdn/content/pulls>)
to post the comment to.

### `--verbose`

This is mostly useful for local development or when debugging. It determines whether
to print to `stdout` what it would post as a PR issue comment.

This option, just like the `--dry-run` is technically part of the `deployer` command
and not the `analyze-pr-build` sub-command. So put it before the `analyze-pr-build`.

### A complete example

This example demonstrates all options.

```sh
poetry run deployer --verbose --dry-run analyze-pr-build ../client/build \
  --analyze-flaws --analyze-dangerous-content --github-token="xxx" \
  --repo=peterbe/content --pr-number=3
```

## Debugging Analyze PR builds

An important part of the `analyze-pr-builds` command is that it must be easy to
debug and develop further without having to rely on landing code in `main`
and seeing how it worked.

The first thing you need to do is to download a `build` artifact or to simply
run `yarn build` and use the `../client/build` directory. To download the artifact
go to a finished "PR Test" workflow,
like <https://github.com/mdn/content/pull/3381/checks?check_run_id=2169672013> for
example. Near the upper right-hand corner of the content (near the "Re-run jobs"
button) it says "Artifacts (1)". Download that `build.zip` file somewhere and unpack
it. Now you can run:

```sh
poetry run deployer --verbose analyze-pr-build ~/Downloads/build ...
```

You can even go and get a personal access token and set `$GITHUB_TOKEN`
(assuming it has the right scopes) and have it actually post the comment.

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
- `DEPLOYER_ELASTICSEARCH_URL` used by the `search-index` command.
- `CONTENT_ROOT` is equivalent to using `--content-root` (there is no
  default)
- `CONTENT_TRANSLATED_ROOT` is equivalent to using `--content-translated-root`
  (there is no default)

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
