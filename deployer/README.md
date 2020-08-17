# deployer

Ship a Yari static site for web hosting.

## Limitations and caveats

- Redirects - in the build directory we're supposed to have
  `/en-us/_redirects.txt`

- Without Lambda@Edge in front of the S3 Website some URLs won't map correctly.

- GitHub integration

## How it works

This project's goal is ultimately to take a big directory of files and
upload them to S3. But there are some more advanced features so as
turning `_redirects.txt` files into S3 redirect keys. And there might be
file system names that don't match exactly what we need the S3 key to
be called exactly.

All deployments, generally, go into the one same S3 bucket. But in that bucket
you always have a "prefix" (aka. a root folder) which gets used by
CloudFront so you can have _N_ CloudFront distributions for 1 S3 bucket.
For example, one prefix might be called `master` which'll be the
production site. Another prefix might be `peterbe-pr12345`.

It might be worth considering having 2 buckets:

- One for production builds

- One for pull request builds

So every deployment has a prefix (aka. the "name") which can be automatically
generated based on the name of the current branch, but if it's known
from the CI environment, even better, then we don't need to ask git.
The first thing it does is that it downloads a complete listing of
every known key in the bucket under that prefix and each key's size.
(That's all you get from `bucket.list_objects_v2`). Now, it starts to
walk the local directory and for each _file_ it applies the following logic:

- Does it S3 key _not_ exist at all? --> Upload brand new S3 key!
- Does the S3 key _exist_?
  - Is the file size different from the S3 key size? --> Upload changed S3 key!
  - Is the file size exactly the same as the S3 key size? --> Download the
    S3 key's `Metadata->filehash`.
    - Is the hash exactly the same as the file's hash? --> Do nothing!
    - Is the hash different? --> Upload changed S3 key!

When it uploads an S3 key, _always_ compute the local file's hash and
include that as a piece of S3 key Metadata.

## Getting started

You can install it globally or in a virtualen environment. Whatever floats
float fancy.

    poetry install
    poetry run deployer --help

Please refer to the [`boto3` documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration) with regards to configuring AWS access credentials.

### Actually uploading something

The sub-command for uploading is called `upload`. You use it like this:

    poetry run deployer upload --help

An example of this is, if you know what you want your bucket to be called
and you know what the folder prefix should be, and you have built the whole
site in `../client/build`:

    poetry run deployer upload --bucket mdn-yari --name pr1234 ../client/build

## Environment variables

All the options you can specify with the CLI can equally be expressed
as environment variables. You just need to prefix it with `DEPLOYER_` and
write it all upper case.

    export DEPLOYER_BUCKET=peterbe-yari
    export DEPLOYER_NAME=master
    poetry run deployer upload ../client/build

...is the same as...

    poetry run deployer upload --bucket peterbe-yari --name master ../client/build

Other things you can set (excluding AWS credentials for `boto3`):

- `AWS_PROFILE` - default: `default`
- `S3_BUCKET_LOCATION` - default: `''`
- `DEPLOYER_MAX_WORKERS_PARALLEL_UPLOADS` - default: `50`
- `DEPLOYER_CACHE_CONTROL` - default: `60 * 60`
- `DEPLOYER_HASHED_CACHE_CONTROL` - default: `60 * 60 * 24 * 365`
- `DEPLOYER_NO_PROGRESSBAR` - default: `false`

## Goal

To be dead-easy to use and powerful at the same time.

## Contributing

You need to have [`poetry` installed on your system](https://python-poetry.org/docs/).
Now run:

    cd deployer
    poetry install

That should have installed the CLI:

    poetry run deployer

If you wanna make a PR, make sure it's formatted with `black` and
passes `flake8`.

You can check that all files are `flake8` fine by running:

    flake8 deployer

And to check that all files are formatted according to `black` run:

    black --check deployer
