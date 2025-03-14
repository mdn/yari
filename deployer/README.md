# Deployer

Yari Deployer's only remaining purpose is to update the Elasticsearch index.

Previously, it also uploaded files to AWS S3 buckets, deployed AWS Lambdas, and
powered the PR Review Companion, but these features have been removed.

## Getting started

You can install it globally or in a `virtualenv` environment. Whichever you
prefer.

```sh
cd deployer
poetry install
poetry run deployer --help
```

## Elasticsearch indexing

You just need a URL (or host name) for an Elasticsearch server and the root of
the build directory. The command will trawl all `index.json` files and extract
all metadata and blocks of prose which get their HTML stripped. The command is:

```sh
cd deployer
poetry run deployer search-index --help
```

If you have built the whole site (or partially) you simply point to it with the
first argument:

```sh
poetry run deployer search-index ../client/build
```

But by default, it does not specify the Elasticsearch URL/host. You can either
use:

```sh
export DEPLOYER_ELASTICSEARCH_URL=http://localhost:9200
poetry run deployer search-index ../client/build
```

...or...

```sh
poetry run deployer search-index ../client/build --url http://localhost:9200
```

**Note!** If you don't specify either the environment variable or the `--url`
option, the script will _not_ fail (ie. exit non-zero). This is to make it
convenient in GitHub Actions to control the execution purely based on the
presence of the environment variable.

### About Elasticsearch aliases

The default behavior is that each day you get a different index name. E.g.
`mdn_docs_20210331093714`. And then there's an alias with a more "generic" name.
E.g. `mdn_docs`. It's the alias name that Kuma uses to send search queries to.

The way indexing works is that we leave the existing index and its alias in
place, then we fill up a new index and once that works, we atomically "move the
alias" and delete the old index. To demonstrate, consider this example timeline:

- Yesterday: index `mdn_docs_20210330093714` and
  `mdn_docs --> mdn_docs_20210330093714`
- Today:
  - create new index `mdn_docs_20210331094500`
  - populate `mdn_docs_20210331094500` (could take a long time)
  - atomically re-assign alias `mdn_docs --> mdn_docs_20210331094500` and delete
    old index `mdn_docs_20210330093714`
  - delete old index `mdn_docs_20210330`

Note, this only applies if you _don't_ use `--update`. If you use `--update` it
will just keep adding to the existing index whose name is based on today's date.

What this means it that **there is zero downtime for the search queries**.
Nothing needs to be reconfigured on the Kuma side.

### To update or not start a fresh

The default behavior is that it deletes the index first and immediately creates
it again. You can switch this off by using the `--update` option. Then it will
"cake on" the documents. So if something has been deleted since the last build,
you would still have that "stuck" in Elasticsearch.

Deleting and re-creating the index is fast so it's relatively safe to use often.
But the indexing can take many seconds and while indexing, Elasticsearch can
only search what's been indexed so far.

An interesting pattern would be to use `--update` most of the time and only from
time to time omit it for a fresh new start.

But note, if you omit the `--update` (i.e. recreating the index), search will
work. It just may find less that it finds when it's fully indexed.

## Environment variables

The following environment variables are supported.

- `DEPLOYER_ELASTICSEARCH_URL` used by the `search-index` command.

## Contributing

You need to have
[`poetry` installed on your system](https://python-poetry.org/docs/). Now run:

```sh
cd deployer
poetry install --with dev
```

That should have installed the CLI:

```sh
cd deployer
poetry run deployer --help
```

If you want to make a PR, make sure it's formatted with `black` and passes
`flake8`.

You can check that all files are `flake8` fine by running:

```sh
cd deployer
poetry run flake8 .
```

And to format all files with `black` run:

```sh
cd deployer
poetry run black .
```
