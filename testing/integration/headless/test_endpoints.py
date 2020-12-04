import re
from urllib.parse import urlsplit

from pyquery import PyQuery

import pytest

from . import INDEXED_WEB_DOMAINS, request


META_ROBOTS_RE = re.compile(
    r"""(?x)    # Verbose regex mode
    <meta\s+                        # meta tag followed by whitespace
    name="robots"\s*                # name=robots
    content="(?P<content>[^"]+)"    # capture the content
    \s*>                            # end meta tag
"""
)


@pytest.fixture()
def is_indexed(base_url):
    hostname = urlsplit(base_url).netloc
    return hostname in INDEXED_WEB_DOMAINS


def test_document(base_url, is_indexed):
    url = base_url + "/en-US/docs/Web"
    resp = request("get", url)
    assert resp.status_code == 200
    assert resp.headers["Content-Type"] == "text/html; charset=utf-8"
    meta = META_ROBOTS_RE.search(resp.text)
    assert meta
    content = meta.group("content")
    if is_indexed:
        assert content == "index, follow"
    else:
        assert content == "noindex, nofollow"


def test_document_based_redirection(base_url):
    """Ensure that content-based redirects properly redirect."""
    url = base_url + "/en-US/docs/concat"
    resp = request("get", url)
    assert resp.status_code == 301
    assert (
        resp.headers["Location"]
        == "/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/concat"
    )


def test_home(base_url, is_indexed):
    url = base_url + "/en-US/"
    resp = request("get", url)
    assert resp.status_code == 200
    assert resp.headers["Content-Type"] == "text/html; charset=utf-8"
    meta = META_ROBOTS_RE.search(resp.text)
    assert meta
    content = meta.group("content")
    if is_indexed:
        assert content == "index, follow"
    else:
        assert content == "noindex, nofollow"
    html = PyQuery(resp.text)
    assert html.find("head > title").text() == "MDN Web Docs"


def test_hreflang_basic(base_url):
    """Ensure that we're specifying the correct value for lang and hreflang."""
    url = base_url + "/en-US/docs/Web/HTTP"
    resp = request("get", url)
    assert resp.status_code == 200
    html = PyQuery(resp.text)
    assert html.attr("lang") == "en"
    assert html.find('head > link[hreflang="en"][href="{}"]'.format(url))


@pytest.mark.parametrize(
    "uri,expected_keys",
    [["/api/v1/whoami", [("waffle", ("flags", "switches", "samples"))]]],
    ids=("whoami",),
)
def test_api_basic(base_url, uri, expected_keys):
    """Basic test of site's api endpoints."""
    resp = request("get", base_url + uri)
    assert resp.status_code == 200
    assert resp.headers.get("content-type") == "application/json"
    data = resp.json()
    for item in expected_keys:
        if isinstance(item, tuple):
            key, sub_keys = item
        else:
            key, sub_keys = item, ()
        assert key in data
        for sub_key in sub_keys:
            assert sub_key in data[key]


# Test value tuple is:
# - Expected locale prefix
# - Accept-Language header value
LOCALE_SELECTORS = {
    "en-US": ("en-US", "en-US"),
    "es": ("es", "es"),
    "de": ("de", "de"),
}


@pytest.mark.parametrize(
    "expected,accept", LOCALE_SELECTORS.values(), ids=list(LOCALE_SELECTORS),
)
@pytest.mark.parametrize(
    "slug",
    [
        "/",
        "/docs/Web",
        "/search",
        "/events",
        "/profile",
        "/profiles/sheppy",
        "/users/signin",
        "/promote",
        "/docs/Web/HTML",
        "/docs/Learn/CSS/Styling_text/Fundamentals#Color",
    ],
)
def test_locale_selection(base_url, slug, expected, accept):
    """
    Ensure that locale selection, which depends on the "Accept-Language"
    header, works for the provided URL's.
    """
    url = base_url + slug
    assert expected, "expected must be set to the expected locale prefix."
    assert accept, "accept must be set to the Accept-Langauge header value."
    response = request("get", url, headers={"Accept-Language": accept})
    assert response.status_code == 302
    assert response.headers["location"].startswith("/{}".format(expected))
