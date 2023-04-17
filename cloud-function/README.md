# Cloud Function

This is MDN's HTTP request handler, deployed using [Cloud Functions](https://cloud.google.com/functions/) behind [Cloud CDN](https://cloud.google.com/cdn/). It mostly proxies requests and handles some special routes directly.

## Environment variables

The function uses the following environment variables:

* `ORIGIN_MAIN` (default: `"localhost"`) - The expected `Host` header value for requests to the main site.
* `ORIGIN_LIVE_SAMPLES` (default: `"localhost"`) - The expected `Host` header value for requests to live samples.
* `SOURCE_CONTENT` (default: `"http://localhost:8100"`) - The URL at which the built content is served.
* `SOURCE_RUMBA` (default: `"http://localhost:8000"`) - The URL at which the API is served.

The placement handler uses the following environment variables:

* `KEVEL_SITE_ID` (default: `0`) - Required for serving placements via Kevel.
* `KEVEL_NETWORK_ID` (default: `0`) - Required for serving placements via Kevel.
* `SIGN_SECRET` (default: `""`) - Required for serving placements.
* `CARBON_ZONE_KEY` (default: `""`) - Required for serving placements via Carbon.
* `CARBON_FALLBACK_ENABLED` (default: `"false"`) - Whether fallback placements should be served via Carbon.

You can override the defaults by adding `.env` file with `KEY=value` lines.
