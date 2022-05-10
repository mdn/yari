# Signing in

## Introduction

Signing in means you click a link to go straight to a Kuma endpoint which will
redirect you back to where you were.

Yari produces a SPA app at `/$locale/signin`. It presents to clickable links to
our supported identity providers. Clicking the "Sign in" in the header will note
which page you were on, then it goes to `/$locale/signin?next=page/you/were/on`

When the user picks a identity provider they leave the static site nature of
Yari and dynamically render a Kuma page which itself, will trigger a redirect to
the identity providers authentication screen. If the user completes that, it
will redirect back to Kuma sets your cookie and then redirects back according to
what `?next=...` was.

## Local development

The jumping between static Yari and dynamic Kuma works well in production
because you have both backends seamlessly behind the same CDN domain. That's not
the case in local development. In short, to get this to work in local
development you have to (`docker-compose up`) start Kuma in one terminal and
start Yari in another. But before you start Yari, set the following in your
`.env` file:

```sh
# This tells the sign in link to forcibly switch the whole domain in the
# links to the identity provider choice links.
REACT_APP_KUMA_HOST=localhost:8000
```
