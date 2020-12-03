from urllib.parse import urlsplit

import requests

from . import INDEXED_WEB_DOMAINS


def test_robots(base_url):
    url = base_url + "/robots.txt"
    response = requests.get(url)
    assert response.status_code == 200

    urlbits = urlsplit(base_url)
    hostname = urlbits.netloc
    if hostname in INDEXED_WEB_DOMAINS:
        assert "Sitemap: " in response.text
        assert "Disallow:\n" not in response.text
        assert "Disallow: /" in response.text
    else:
        assert "Disallow: /\n" in response.text
