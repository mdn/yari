# Faking the /api/v1/whoami

## Quickstart

There are 2 ways you can simulate the `/api/v1/whoami` outside of production.

1. For local development (`localhost:5000`) when using Express.
1. For dev builds using CloudFront where we use the `*.content.dev.mozit.cloud` domain.

For more information about to fake it locally, using file system or Kuma
(`localhost.org:8000`), see [proxying.md](proxying.md).

## Debugging in dev builds

tl;dr
[Example URL](https://main.content.dev.mdn.mozit.cloud/api/v1/whoami/?_whoami.waffle.switches.developer_needs=true&_whoami.waffle.flags.subscriptions=true&other=true&_whoami.avatar_url=https://api.adorable.io/avatars/45/peter&_whoami.is_authenticated=true&_whoami.username=peterbe)

The Lambda@Edge is aware when a request is on any of the dev domains. If the
query string contains certain keys, it will use that to make up the JSON payload.

Also, these special query strings keys can be used on Yari itself, and it will
copy those on the main URL and pass them on to the fake `whoami` endpoint.
For example, in the example URL above, replace the URL pathname to something
like `/en-US/docs/Web?_whoami.username=peterbe` and it will carry these
to `/api/v1/whoami` when it does the XHR request.

The rules are simple. If you want the payload to become:

```json
{
  "username": "peterbe",
  "waffle": {
    "flags": {
      "foo": "bar"
    },
    "switches": {},
    "samples": {}
  }
}
```

...you set `?_whoami.username=peterbe&_whoami.waffle.flags.foo=bar`.
