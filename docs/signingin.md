# Signing in and signing up

## Introduction

Signing in means you click a link to go straight to a Kuma endpoint which
will redirect you back to where you were.

Yari produces a SPA app at `/$locale/signin`. It presents to clickable
links to our supported identity providers. Clicking the "Sign in" in the
header will note which page you were on, then it goes to
`/$locale/signin?next=page/you/were/on`

When the user picks a identity provider they leave the static site
nature of Yari and dynamically render a Kuma page which itself,
will trigger a redirect to the identity providers authentication screen.
If the user completes that, it will redirect back to Kuma which then
makes a decision...

1. If you've signed in before (aka. signed up) you're redirected back to
   that original `?next=...` variable that was set when you clicked "Sign in".
2. You've never signed in before, Kuma stores the identity provider authentication
   callback data in a session cookie, and redirects the user to `/$locale/signup`
   which is a static Yari SPA. On that page you need to check a "Terms and conditions"
   checkbox and make a POST request to Kuma. Only then will kuma store the new
   user account in its database and if all goes well, it redirects to that
   originl `?next=...` URL or `/$locale/` if the `next` variable was lost.

## Local development

The jumping between static Yari and dynamic Kuma works well in production because
you have both backends seamlessly behind the same CDN domain. That's not the case
in local development. In short, to get this to work in local development you
have to (`docker-compose up`) start Kuma in one terminal and start Yari in
another. But before you start Yari, set the following in your `.env` file:

```sh
# This tells your React dev server that it's OK to use http://localhost.org:3000
# instead of the usual http://localhost:3000
HOST=localhost.org

# This tells the sign in link to forcibly switch the whole domain in the
# links to the identity provider choice links.
REACT_APP_KUMA_HOST=localhost.org:8000
```
