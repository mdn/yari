import json
import os
import sys

from decouple import AutoConfig

config = AutoConfig(os.curdir)

CI = config("CI", default=False, cast=bool)

CONTENT_ROOT = config("CONTENT_ROOT", default=None)
CONTENT_TRANSLATED_ROOT = config("CONTENT_TRANSLATED_ROOT", default=None)

DEFAULT_BUCKET_NAME = config("DEPLOYER_BUCKET_NAME", default="mdn-content-dev")
DEFAULT_BUCKET_PREFIX = config("DEPLOYER_BUCKET_PREFIX", default="main")

# When uploading a bunch of files, the work is done in a thread pool.
# If you use too many "workers" it might saturate your network, meaning it's
# ultimately slower.
MAX_WORKERS_PARALLEL_UPLOADS = config(
    "DEPLOYER_MAX_WORKERS_PARALLEL_UPLOADS", default=50, cast=int
)

# E.g. /en-US/docs/Foo/Bar
DEFAULT_CACHE_CONTROL = config("DEPLOYER_CACHE_CONTROL", default=60 * 60 * 24, cast=int)
# E.g. '2.02b14290.chunk.css'
HASHED_CACHE_CONTROL = config(
    "DEPLOYER_HASHED_CACHE_CONTROL", default=60 * 60 * 24 * 365, cast=int
)

DEFAULT_NO_PROGRESSBAR = config(
    "DEPLOYER_NO_PROGRESSBAR",
    default=not sys.stdout.isatty() or bool(json.loads(os.environ.get("CI", "false"))),
    cast=bool,
)

# If true, it will log every successful upload task as it happens.
LOG_EACH_SUCCESSFUL_UPLOAD = config(
    "DEPLOYER_LOG_EACH_SUCCESSFUL_UPLOAD", default=False, cast=bool
)

# You get this from https://speedcurve.com/mozilla-add-ons/mdn/admin/teams/
SPEEDCURVE_DEPLOY_API_KEY = config("SPEEDCURVE_DEPLOY_API_KEY", default=None)
# Use the API key and see instructions on https://api.speedcurve.com/#get-all-sites
SPEEDCURVE_DEPLOY_SITE_ID = config("SPEEDCURVE_DEPLOY_SITE_ID", default=None)

# If you're doing local development, you can download and install your own
# instance of Elasticsearch 7 and start it. Then set this environment variable
# value to `http://localhost:9200`
ELASTICSEARCH_URL = config("DEPLOYER_ELASTICSEARCH_URL", default=None)


DEFAULT_REPO = config("GITHUB_REPOSITORY", default=None)

DEFAULT_GITHUB_TOKEN = config("GITHUB_TOKEN", default=None)
