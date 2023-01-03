import pytest


def pytest_configure(config):
    """Configure pytest for the Rumba deployment under test."""

    # The pytest-base-url plugin adds --base-url, and sets the default from
    # environment variable PYTEST_BASE_URL. If still unset, force to staging.
    if config.option.base_url is None:
        config.option.base_url = "https://developer.allizom.org"


@pytest.fixture(scope="session")
def media_url():
    return "https://media.prod.mdn.mozit.cloud"
