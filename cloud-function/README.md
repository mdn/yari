# Cloud Function

This is MDN's HTTP request handler, deployed using
[Cloud Functions](https://cloud.google.com/functions/) behind
[Cloud CDN](https://cloud.google.com/cdn/). It mostly proxies requests and
handles some special routes directly.

## Quickstart

Run `npm start` to serve the Cloud Function at http://localhost:7100/.

By default, it will use your local `client/build` directory, serving it at
http://localhost:8100/, and proxy API requests to the stage API at
`https://developer.allizom.org/`.

### How to use a local Rumba?

Set `SOURCE_API=http://localhost:8000/` in your `.env.`

### How to use Glean?

To use Glean, the Cloud Function must be accessed via HTTPS. Otherwise the
Glean.js SDK throws an uncaught error that prevents execution of JavaScript.

We recommend using [mkcert](https://github.com/FiloSottile/mkcert) to create a
locally-trusted development certificate. Add the key and certificate paths as
`HTTPS_KEY_FILE` and `HTTPS_CERT_FILE` variables to your `.env` file. This will
automatically enable an HTTPS proxy at https://localhost/ in addition to
`http://localhost:7100/`.

## Environment variables

The function uses the following environment variables:

- `ORIGIN_MAIN` (default: `"localhost"`) - The expected `Host` header value for
  requests to the main site.
- `ORIGIN_LIVE_SAMPLES` (default: `"localhost"`) - The expected `Host` header
  value for requests to live samples.
- `SOURCE_CONTENT` (default: `"http://localhost:8100"`) - The URL at which the
  client build is served.
- `SOURCE_API` (default: `"https://developer.allizom.org/"`) - The URL at which
  the API is served.

The placement handler uses the following environment variables:

- `KEVEL_SITE_ID` (default: `0`) - Required for serving placements via Kevel.
- `KEVEL_NETWORK_ID` (default: `0`) - Required for serving placements via Kevel.
- `SIGN_SECRET` (default: `""`) - Required for serving placements.
- `BSA_ZONE_KEYS` (default: `""`) - Required for serving placements via BSA.
- `BSA_URL_PREFIX`(default: `""`) - Where to show BSA placements if enabled.
  Formatted like : "placementname1:zonekey1;placementkey2:zonekey2...".
- `BSA_ENABLED` (default: `"false"`) - Whether to use placements via BSA.

You can override the defaults by adding a `.env` file with `KEY=value` lines.
