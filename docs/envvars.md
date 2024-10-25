# Environment Variables

Most things can be controlled via environment variables. Some things are
specific to the client and some are specific to the builder etc.

This document attempts to describe each environment variable.

## General

### `EDITOR`

#### Default: n/a

This is a general OS, optional, environment variable and it's needed if you want
the ability to go from viewing a rendered document to opening the source in your
preferred editor. It's needed for the "Edit this page in your editor" button to
work.

## Builder

For the builder, a lot of environment variables can be overridden with CLI
arguments.

The general rule is that environment variables specific to the builder are all
prefixed with `CONTENT_`. E.g. `CONTENT_ROOT`

### `CONTENT_ROOT`

**Default: `../content/files`**

Path to the content files, cloned from https://github.com/mdn/content.

### `CONTENT_TRANSLATED_ROOT`

**Default: `../translated-content/files`**

Path to the translated content files, cloned from
https://github.com/mdn/translated-content.

### `CONTRIBUTOR_SPOTLIGHT_ROOT`

**Default: `../mdn-contributor-spotlight/contributors`**

Path to the contributor spotlight content, cloned from
https://github.com/mdn/mdn-contributor-spotlight.

### `CURRICULUM_ROOT`

**Default: `../curriculum`**

Path to the curriculum content, cloned from https://github.com/mdn/curriculum.

### `BUILD_FOLDERSEARCH`

**Default: ``** (meaning, none)

**Example: `web/css,web/html`**

Applicable if you run batches of builds but want to limit it to only the folders
you care about. When doing a batch build, it can be very time-consuming so just
doing one or two sub-folders will speed things up.

### `BUILD_FILES`

**Default: `[]`**

A comma or newline separated list of file paths. Can be absolute or relative to
the `CONTENT_ROOT`.

### `BUILD_OUT_ROOT`

**Default: `client/build`**

Location into which things should be built.

### `BUILD_FLAW_LEVELS`

**Default: `*:warn`**

To set this you need to know what all the possible flaw identifiers are called.
The complete set can be found in `content/src/constants.js` in
`VALID_FLAW_CHECKS`. And the level values are `error`, `warn`, or `ignore`.

The value of this environment variable is a comma separated string. Any
identifier or level value that is not recognized will throw an error.

You can mix and match like this for example:

```sh
macros:error, broken_links: warn, bad_bcd_queries: ignore
```

Anything _not_ mentioned defaults to `ignore`, so the above example is
equivalent to:

```sh
macros:error, broken_links: warn
```

When a flaw is discovered, if the level is `error` it will, halt the build and
throw an error. It will halt on the first flaw error encountered. If the level
is `warn` it will inject the flaw message into the built `index.json` file which
you can view when rendering the document on `http://localhost:3000/`.

### `BUILD_FIX_FLAWS`

**Default: `false`**

Whether fixable flaws should be fixed when building documents.

### `BUILD_FIX_FLAWS_DRY_RUN`

**Default: `false`**

When set to true (with the `BUILD_FIX_FLAWS` flag) it will only print out
information about fixable flaws instead of actually fixing it on disk.

### `BUILD_FIX_FLAWS_VERBOSE`

**Default: `false`**

### `BUILD_LIVE_SAMPLES_BASE_URL`

**Default: `https://live.mdnplay.dev`**

When generating live samples `<iframe>` tags, the `src` attribute gets this set
as a prefix. The ultimate reason why it's meant to be different is because the
security of the `iframe`'s content has not been audited as carefully as the rest
of the site.

When doing local development, it's recommended to set this to
`http://localhost:5042` in your personal `.env`.

### `BUILD_LEGACY_LIVE_SAMPLES_BASE_URL`

**Default: `https://live-samples.mdn.mozilla.net`**

Used to serve legacy lives samples that do not support playground rendering.

### `BUILD_INTERACTIVE_EXAMPLES_BASE_URL`

**Default: `https://interactive-examples.mdn.mozilla.net`**

The base URL used in the Interactive Example iframes.

### `BUILD_GOOGLE_ANALYTICS_MEASUREMENT_ID`

**Default: `''`**

If set, the rendered HTML will have a Google Analytics snippet. For example, to
test use: `export BUILD_GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXX`. By default
it's disabled (empty string).

For dual tagging (UA + GA4), multiple IDs can be separated by a comma:

```env
export BUILD_GOOGLE_ANALYTICS_MEASUREMENT_ID=UA-00000000-0,G-XXXXXXXX
```

### `BUILD_ALWAYS_ALLOW_ROBOTS`

**Default: `false`**

This exists so we can forcibly always include
`<meta name="robots" content="noindex, nofollow">` into the HTML no matter what.
For example, on our stage or dev builds, we never want robots.

The only place where we want robots is in prod. That's explicitly always set in
`prod-build.yml`.

We use this to make absolutely sure that no dev or stage build ever gets into
the Google index. Thankfully we _always_ used a canonical URL
(`<link rel="canonical" href="https://developer.mozilla.org/$uri">`) as a
"second line of defense" for dev/stage URLs that are public.

### `BUILD_HOMEPAGE_FEED_URL`

**Default: `https://hacks.mozilla.org/feed/`**

Which RSS feed URL to parse for displaying feed entries on the home page.

### `BUILD_HOMEPAGE_FEED_DISPLAY_MAX`

**Default: `5`**

How many RSS feed entries to display on the home page.

### `BUILD_FIX_FLAWS_TYPES`

**Default: `broken_links`**

Flaw types to be fixed when running `fix-flaws`.

## Server

### `SERVER_HOST`

**Default: (undefined)**

Set this to `0.0.0.0` to access the server from a different local device.

### `SERVER_PORT`

**Default: `5042`**

Usually the `server` module is started with `foreman` (the `nf` command) and
this is the default port.

### `SERVER_WEBSOCKET_PORT`

**Default: `8080`**

This is the port for the WebSocket server, which is started when you run
`yarn start`.

### `SERVER_STATIC_ROOT`

**Default `../client/build`**

If you want to serve static files some a completely different directory.

## Client

NOTE! Due to a quirk of how we build the client, anything `REACT_APP_*`
environment variable that you want to be available in the production-grade built
JS code that gets used when use `localhost:5042` can not only be set in the root
`/.env` file. Either use `export REACT_APP_*=...` or write it once in `/.env`
and once in `/client/.env`.

### `HOST`

**Default: `localhost`**

Suggested value: `HOST=localhost.org`

For browser cookies to work as expected, you need to use the same host name in
Yari and in Kuma. The port numbers can be different. That means that any cookies
you picked up (e.g. `sessionid`) over on `http://localhost.org:8000` will be
automatically included in XHR calls on `http://localhost.org:3000`.

Note that even if you set this, you can still continue to use
`http://localhost:3000`.

### `REACT_APP_AI_FEEDBACK_GITHUB_REPO`

**Default: `mdn/private-ai-feedback`**

The GitHub repository to use for reporting issues with AI Help answers.

### `REACT_APP_BCD_BASE_URL`

**Default: `https://bcd.developer.allizom.org`**

The base URL (without trailing slash) used to fetch data for BCD tables.

If you want to use local BCD data, set `REACT_APP_BCD_BASE_URL=""`.

### `REACT_APP_KUMA_HOST`

**Default: `not set`**

When doing local development in Yari, the "Sign in" URL depends on this. If
you're running the dev server (i.e. `localhost:3000` or `localhost.org:3000`)
the link to sign in with Kuma needs this to be set.

The suggested value is to set this to set
`REACT_APP_KUMA_HOST=localhost.org:8000` and now sign in links go to that host
name instead. That means you can log in _from_ Yari with a single click.

### `REACT_APP_DISABLE_AUTH`

**Default: `false`**

This removes sign-in and `whoami` XHR fetching. Useful when using Yari purely
for content editing as authentication is then not required.

### `REACT_APP_DEV_MODE`

**Default: `false`**

Enables features or setup which only make sense in local development.

### `REACT_APP_WRITER_MODE`

**Default: `false`**

Basically, these are the optional, lazy-loaded features of the app that only
make sense when you're working on authoring the content. For example the Toolbar
bar appears based on this.

### `REACT_APP_WRITER_MODE_HOSTNAMES`

**Default: `localhost, localhost.org, 127.0.0.1`**

Only applicable if `REACT_APP_WRITER_MODE` is truthy. Essentially you can
disable certain CRUD mode features depending on the hostname you use. So if you
built the static assets (the React code) with `REACT_APP_WRITER_MODE=true` it
might disable certain features if you use a `window.location.hostname` that is
_not_ in this list.

The use case for this is when you build the site in a pull request and want
flaws to _appear_ but without the "Fix fixable flaws" link or the "Open in your
editor" button. We use this for previewing PR builds on the content site. Those
pages are built with flaw detection set to warn, but since you might be viewing
the pages on a remote domain (e.g. `pr123.dev.content.mozit.cloud`) it doesn't
make sense to present the "Fix fixable flaws" button for example.

### `REACT_APP_ENABLE_PLUS`

**Default: `false`**

Determines if the MDN++ SPA should be reachable or not.

### `REACT_APP_DEFAULT_GEO_COUNTRY`

**Default: `United States`**

If the `/api/v1/whoami` does not include a `geo.country` value, fall back on
this. Setting this allows you to pretend the XHR request to `/api/v1/whoami`
included this value for `geo.country`.

### `REACT_APP_DEFAULT_GEO_COUNTRY_ISO`

**Default: `US`**

If the `/api/v1/whoami` does not include a `geo.country_iso` value, fall back on
this. Setting this allows you to pretend the XHR request to `/api/v1/whoami`
included this value for `geo.country_iso`.

## Glean (Analytics)

### `REACT_APP_GLEAN_CHANNEL`

**Default: `"dev"`**

- This routes glean analytics to either prod/staging in the backend. See
  [Glean docs](https://mozilla.github.io/glean/book/reference/general/initializing.html?highlight=channel#gleaninitializeconfiguration)

### `REACT_APP_GLEAN_DEBUG`

**Default: `false`**

- Setting this to true logs glean pings to the console to help debug.

### `REACT_APP_GLEAN_ENABLED`

**Default: `false`**

- Disables/Enables glean upload. This should be set to `true` in prod and
  staging to send glean telemetry to the server
  - Be aware of flipping this between true/false as any persisted metrics,
    events and pings (other than first_run_date and first_run_hour) are cleared.
    [More info](https://mozilla.github.io/glean/book/reference/general/initializing.html#when-upload-is-disabled)

### REACT_APP_PLAYGROUND_BASE_HOST

**Default: mdnplay.dev**

- Sets the host name for the playground iframe. Set this to `localhost:5042`
  when working on playground functionality.

### REACT_APP_OBSERVATORY_API_URL

**Default: `https://observatory-api.mdn.allizom.net`**

- Base url for the Observatory API server.
