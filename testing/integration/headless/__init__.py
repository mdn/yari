import requests


DEFAULT_TIMEOUT = 120  # seconds
# Kuma web domains that are indexed
INDEXED_WEB_DOMAINS = {"developer.mozilla.org"}


def request(method, url, **kwargs):
    if "timeout" not in kwargs:
        kwargs.update(timeout=DEFAULT_TIMEOUT)
    if "allow_redirects" not in kwargs:
        kwargs.update(allow_redirects=False)
    return requests.request(method, url, **kwargs)
