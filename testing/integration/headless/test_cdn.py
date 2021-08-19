import pytest

from . import request


def is_cloudfront_cache_hit(response):
    """CloudFront specific check for evidence of a cache hit."""
    return response.headers["x-cache"] in (
        "Hit from cloudfront",
        "RefreshHit from cloudfront",
    )


def is_cloudfront_cache_miss(response):
    """CloudFront specific check for evidence of a cache miss."""
    return response.headers["x-cache"] in (
        "Miss from cloudfront",
        "RefreshHit from cloudfront",
    )


def is_cloudfront_error(response):
    """CloudFront specific check for evidence of an error response."""
    return response.headers["x-cache"] == "Error from cloudfront"


def is_cdn_cache_hit(response):
    """Checks the response for evidence of a cache hit on the CDN."""
    return is_cloudfront_cache_hit(response)


def is_cdn_cache_miss(response):
    """Checks the response for evidence of a cache miss on the CDN."""
    return is_cloudfront_cache_miss(response)


def is_cdn_error(response):
    """Checks the response for evidence of an error from the CDN."""
    return is_cloudfront_error(response)


def assert_not_cached_by_cdn(
    url,
    expected_status_code=200,
    expected_location=None,
    method="get",
    **request_kwargs,
):
    response = request(method, url, **request_kwargs)
    assert response.status_code == expected_status_code
    if expected_status_code in (301, 302) and expected_location:
        if callable(expected_location):
            assert expected_location(response.headers["location"])
        else:
            assert response.headers["location"] == expected_location
    if expected_status_code >= 400:
        assert is_cdn_error(response)
    else:
        assert is_cdn_cache_miss(response)
    return response


def assert_not_cached(
    url,
    expected_status_code=200,
    expected_location=None,
    is_behind_cdn=True,
    method="get",
    **request_kwargs,
):
    if is_behind_cdn:
        response1 = assert_not_cached_by_cdn(
            url, expected_status_code, expected_location, method, **request_kwargs
        )
        response2 = assert_not_cached_by_cdn(
            url, expected_status_code, expected_location, method, **request_kwargs
        )
        if expected_status_code in (301, 302) and not expected_location:
            if "/users/github/login/" not in url:
                assert response2.headers["location"] == response1.headers["location"]
        return response2

    response = request(method, url, **request_kwargs)
    assert response.status_code == expected_status_code
    assert "no-cache" in response.headers["Cache-Control"]
    assert "no-store" in response.headers["Cache-Control"]
    assert "must-revalidate" in response.headers["Cache-Control"]
    assert "max-age=0" in response.headers["Cache-Control"]
    return response


def assert_cached(
    url,
    expected_status_code=200,
    expected_location=None,
    is_behind_cdn=True,
    method="get",
    **request_kwargs,
):
    response = request(method, url, **request_kwargs)
    assert response.status_code == expected_status_code
    if expected_status_code in (301, 302) and expected_location:
        if callable(expected_location):
            assert expected_location(response.headers["location"])
        else:
            assert response.headers["location"] == expected_location
    if is_behind_cdn:
        if is_cdn_cache_miss(response):
            response2 = request(method, url, **request_kwargs)
            assert response2.status_code == expected_status_code
            assert is_cdn_cache_hit(response2)
            if expected_status_code == 200:
                assert response2.content == response.content
            elif expected_status_code in (301, 302):
                if expected_location:
                    if callable(expected_location):
                        assert expected_location(response2.headers["location"])
                    else:
                        assert response2.headers["location"] == expected_location
                else:
                    assert response2.headers["location"] == response.headers["location"]
        else:
            assert is_cdn_cache_hit(response)
    else:
        assert "public" in response.headers["Cache-Control"]
        assert ("max-age" in response.headers["Cache-Control"]) or (
            "s-maxage" in response.headers["Cache-Control"]
        )
    return response


@pytest.mark.parametrize(
    "slug,status,expected_location",
    [
        ("/_kuma_status.json", 200, None),
        ("/_whatsdeployed/code.json", 200, None),
        ("/_whatsdeployed/content.json", 200, None),
        ("/healthz", 204, None),
        ("/readiness", 204, None),
        ("/api/v1/whoami", 200, None),
        ("/en-US/users/signout", 404, None),
        ("/users/github/login/?next=/en-US/", 404, None),
        ("/users/google/login/?next=/en-US/", 404, None),
        ("/admin/login/", 200, None),
        ("/admin/users/user/1/", 302, "/admin/login/?next=/admin/users/user/1/"),
        ("/en-US/docs/Learn/CSS/Styling_text/Fundamentals$samples/Color", 403, None),
    ],
)
def test_not_cached(base_url, is_behind_cdn, slug, status, expected_location):
    """Ensure that these endpoints respond as expected and are not cached."""
    assert_not_cached(base_url + slug, status, expected_location, is_behind_cdn)


@pytest.mark.parametrize(
    "slug,status,expected_location",
    [
        ("/en-US/", 200, None),
        ("/robots.txt", 200, None),
        ("/favicon.ico", 200, None),
        ("/contribute.json", 200, None),
        ("/humans.txt", 200, None),
        ("/sitemap.xml", 200, None),
        ("/sitemaps/en-US/sitemap.xml.gz", 200, None),
        ("/diagrams/workflow/workflow.svg", 200, None),
        ("/presentations/microsummaries/index.html", 200, None),
        ("/en-US/signup", 200, None),
        ("/en-US/signin", 200, None),
        ("/en-US/settings", 200, None),
        ("/en-US/search?q=css", 200, None),
        ("/en-US/search/?q=css", 302, "/en-US/search?q=css"),
        ("/en-US/search/?q=html", 302, "/en-US/search?q=html"),
        ("/api/v1/search?q=css", 200, None),
        ("/en-US/Firefox", 302, "/en-US/docs/Mozilla/Firefox"),
        ("/en-US/docs/Web/HTML", 200, None),
    ],
)
def test_cached(base_url, is_behind_cdn, slug, status, expected_location):
    """Ensure that these requests are cached."""
    assert_cached(base_url + slug, status, expected_location, is_behind_cdn)


@pytest.mark.parametrize(
    "slug,status",
    [("/files/2767/hut.jpg", 301), ("/@api/deki/files/3613/=hut.jpg", 301)],
)
def test_cached_attachments(base_url, attachment_url, is_behind_cdn, slug, status):
    """Ensure that these file-attachment requests are cached."""
    expected_location = attachment_url + slug
    assert_cached(base_url + slug, status, expected_location, is_behind_cdn)


@pytest.mark.parametrize(
    "zone,status,expected_location",
    [
        ("Add-ons", 302, "/docs/Mozilla/Add-ons"),
        ("Apps", 302, "/docs/Web/Apps"),
        ("Firefox", 302, "/docs/Mozilla/Firefox"),
        ("Learn", 301, "/docs/Learn"),
        ("Marketplace", 302, "/docs/Mozilla/Marketplace"),
    ],
)
def test_zones_without_locale(base_url, is_behind_cdn, zone, status, expected_location):
    """
    Ensure that these zone requests without a locale should redirect and that they
    are cached.
    """
    assert_cached(base_url + f"/{zone}", status, expected_location, is_behind_cdn)
