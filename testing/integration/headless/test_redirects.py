import pytest

from . import request
from utils.urls import assert_valid_url

from .map_301 import (
    DEFAULT_SAMPLES_URLS,
    FIREFOX_ACCOUNTS_URLS,
    FIREFOX_SOURCE_DOCS_URLS,
    GITHUB_IO_URLS,
    LEGACY_URLS,
    MARIONETTE_URLS,
    MISC_REDIRECT_URLS,
    MOZILLADEMOS_URLS,
    REDIRECT_URLS,
    SCL3_REDIRECT_URLS,
    WEBEXT_URLS,
    ZONE_REDIRECT_URLS,
)

# while these test methods are similar, they're each testing a
# subset of redirects, and it was easier to work with them separately.


@pytest.mark.parametrize(
    "url", REDIRECT_URLS, ids=[item["url"] for item in REDIRECT_URLS]
)
def test_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url", GITHUB_IO_URLS, ids=[item["url"] for item in GITHUB_IO_URLS]
)
def test_github_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url", MOZILLADEMOS_URLS, ids=[item["url"] for item in MOZILLADEMOS_URLS]
)
def test_mozillademos_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url", DEFAULT_SAMPLES_URLS, ids=[item["url"] for item in DEFAULT_SAMPLES_URLS]
)
def test_default_samples_redirects(url, base_url, media_url):
    url["base_url"] = base_url
    url["location"] = f"{media_url}{url['url']}"
    assert_valid_url(**url)


@pytest.mark.parametrize("url", LEGACY_URLS, ids=[item["url"] for item in LEGACY_URLS])
def test_legacy_urls(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url", SCL3_REDIRECT_URLS, ids=[item["url"] for item in SCL3_REDIRECT_URLS]
)
def test_slc3_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url", ZONE_REDIRECT_URLS, ids=[item["url"] for item in ZONE_REDIRECT_URLS]
)
def test_zone_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url", MARIONETTE_URLS, ids=[item["url"] for item in MARIONETTE_URLS]
)
def test_marionette_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize("url", WEBEXT_URLS, ids=[item["url"] for item in WEBEXT_URLS])
def test_webext_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url", FIREFOX_ACCOUNTS_URLS, ids=[item["url"] for item in FIREFOX_ACCOUNTS_URLS]
)
def test_firefox_accounts_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url",
    FIREFOX_SOURCE_DOCS_URLS,
    ids=[item["url"] for item in FIREFOX_SOURCE_DOCS_URLS],
)
def test_firefox_source_docs_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "url",
    MISC_REDIRECT_URLS,
    ids=[item["url"] for item in MISC_REDIRECT_URLS],
)
def test_misc_redirects(url, base_url):
    url["base_url"] = base_url
    assert_valid_url(**url)


@pytest.mark.parametrize(
    "retired_locale",
    (
        "ar",
        "bg",
        "bn",
        "ca",
        "el",
        "fa",
        "fi",
        "he",
        "hi-IN",
        "hu",
        "id",
        "it",
        "kab",
        "ms",
        "my",
        "nl",
        "pt-PT",
        "sv-SE",
        "th",
        "tr",
        "uk",
        "vi",
    ),
)
@pytest.mark.parametrize(
    "slug",
    [
        "",
        "/",
        "/docs/Web",
        "/docs/Web/",
        "/search",
        "/search/",
        "/search?q=video",
        "/search/?q=video",
        "/signup",
        "/settings",
    ],
)
def test_retired_locale_redirects(base_url, slug, retired_locale):
    """Ensure that requests for retired locales properly redirect."""
    resp = request("get", f"{base_url}/{retired_locale}{slug}")
    assert resp.status_code == 302
    slug_parts = slug.split("?")
    expected_slug = slug_parts[0].lstrip("/")
    expected_qs = f"?retiredLocale={retired_locale}"
    if len(slug_parts) > 1:
        expected_qs += f"&{slug_parts[1]}"
    assert (
        resp.headers["Location"] == f"/en-US/{expected_slug}{expected_qs}"
    ), f"{resp.headers['Location']} is not /en-US/{expected_slug}{expected_qs}"
