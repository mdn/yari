import os

from decouple import AutoConfig

config = AutoConfig(os.curdir)

CI = config("CI", default=False, cast=bool)

# If you're doing local development, you can download and install your own
# instance of Elasticsearch 7 and start it. Then set this environment variable
# value to `http://localhost:9200`
ELASTICSEARCH_URL = config("DEPLOYER_ELASTICSEARCH_URL", default=None)
