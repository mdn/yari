from urllib.parse import urlsplit, urlunsplit

import pytest

import requests


_KUMA_STATUS = None


def pytest_configure(config):
    """Configure pytest for the Kuma deployment under test."""
    global _KUMA_STATUS

    # The pytest-base-url plugin adds --base-url, and sets the default from
    # environment variable PYTEST_BASE_URL. If still unset, force to staging.
    if config.option.base_url is None:
        config.option.base_url = "https://developer.allizom.org"
    base_url = config.getoption("base_url")

    # Process the server status from _kuma_status.json
    base_parts = urlsplit(base_url)
    kuma_status_url = urlunsplit(
        (base_parts.scheme, base_parts.netloc, "_kuma_status.json", "", "")
    )
    response = requests.get(kuma_status_url, headers={"Accept": "application/json"})
    response.raise_for_status()
    _KUMA_STATUS = response.json()
    _KUMA_STATUS["response"] = {"headers": response.headers}


@pytest.fixture(scope="session")
def kuma_status(base_url):
    return _KUMA_STATUS


@pytest.fixture(scope="session")
def is_behind_cdn(kuma_status):
    return "x-amz-cf-id" in kuma_status["response"]["headers"]


@pytest.fixture(scope="session")
def media_url():
    return "https://media.prod.mdn.mozit.cloud"


@pytest.fixture(scope="session")
def attachment_url(kuma_status):
    return f'https://{kuma_status["settings"]["ATTACHMENT_HOST"]}'
