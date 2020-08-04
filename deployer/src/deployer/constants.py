import json
import sys
import os

from decouple import AutoConfig

config = AutoConfig(os.curdir)

DEFAULT_BUCKET = config("DEPLOYER_BUCKET", "yari")

DEFAULT_NAME = config("DEPLOYER_NAME", default=None)

DEFAULT_NAME_PATTERN = config(
    # "DEPLOYER_DEFAULT_NAME_PATTERN", "{username}-{branchname}"
    "DEPLOYER_NAME_PATTERN",
    "{branchname}",
)

AWS_PROFILE = config("AWS_PROFILE", default="default")

# E.g. us-east-1
S3_DEFAULT_BUCKET_LOCATION = config("S3_BUCKET_LOCATION", default="")

# When uploading a bunch of files, the work is done in a thread pool.
# If you use too many "workers" it might saturate your network meaning it's
# slower.
MAX_WORKERS_PARALLEL_UPLOADS = config(
    "DEPLOYER_MAX_WORKERS_PARALLEL_UPLOADS", default=50, cast=int
)

# E.g. /en-US/docs/Foo/Bar/index.html
DEFAULT_CACHE_CONTROL = config("DEPLOYER_CACHE_CONTROL", default=60 * 60, cast=int)
# E.g. '2.02b14290.chunk.css'
HASHED_CACHE_CONTROL = config(
    "DEPLOYER_HASHED_CACHE_CONTROL", default=60 * 60 * 24 * 365, cast=int
)


DEFAULT_NO_PROGRESSBAR = config(
    "DEPLOYER_NO_PROGRESSBAR",
    cast=bool,
    default=not sys.stdout.isatty() or bool(json.loads(os.environ.get("CI", "0"))),
)
