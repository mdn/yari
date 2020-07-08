# Proxying to Kuma in local development

## Quickstart

Suppose you're working on a feature, in Yari, where you want to make use
of API responses in Kuma. The quickest way to accomplish this is as follows:

1. Start `cd /path/to/kuma && docker-compose up` in a separate terminal
1. Edit the root `.env` file and put in the line: `HOST=localhost.org`
1. Now use `http://localhost.org:3000`

**Note!** When you edit your root `.env` file, you need to stop `yarn start`
and start it up again.

## Logging in

TO BE DESCRIBED

## Faking it

The two main reasons why you would want to fake the JSON is:

1. Don't want to start the Kuma `docker-compose` hog.
1. You want to carefully control the JSON for a specific use case.

The first thing you need to do is to set, in your root `.env` file:

```bash
SERVER_FAKE_V1_API=true
```

Now, you need to create the `.json` files that should be returned. You do that
by creating files whose name matches the request. And the common folder for
all of these is `fake-v1-api`. The filename should match the pathname of the
request plus the `.json` file extension. For example:

```bash
cat ./fake-v1-api/whoami.json
{
  "username": "peter",
  "is_authenticated": true,
  "avatar_url": "https://api.adorable.io/avatars/45/peter",
  "email": "peter@example.com",
  "subscriber_number": 2,
  "is_subscriber": true,
  "waffle": {
    "flags": {
      "kumaediting": true,
      "section_edit": true,
      "spam_checks_enabled": true,
      "subscription": true,
      "subscription_banner": true,
      "subscription_form": true
    },
    "switches": {
      "welcome_email": true,
      "application_ACAO": true,
      "store_revision_ips": true
    },
    "samples": {}
  }
}
```

These are _your_ files to mess with however you like. Knowing exactly what
should be in the JSON is a bit delicate but it's limitless. If you've
set the `SERVER_FAKE_API` environment variable but not created the relevant
`.json` file, the server will turn that into a `404 Not Found` request.

## How this works

When you're browsing around on `http://localhost.org:3000` your browser
will carry a cookie that is tied to the domain `localhost.org`, which got
set when you signed in over on `http://localhost.org:8000`.

So when an XHR request happens within `http://localhost.org:3000`, like this:

```javascript
await fetch("/api/v1/whoami");
```

...what that does is that the request, by the Webpack dev server, is forwarded
to our Yari server (`localhost:5000`) which in turn picks this put and proxies
it leaving the request untouched but essentially only changes the host name.

So a request for `http://localhost:3000/api/v1/whoami` goes from your browser
to `http://localhost:5000/api/v1/whoami` (via Node) proxies it on to
`http://localhost.org:8000/api/v1/whoami`. All along, any cookie tied
to `localhost.org` is automatically appended to the request.

Note that the proxying is **hardcoding** the host (not to be confused with
"host name" which includes the port number) `localhost.org:8000` and that's
how it knows. But this value is only a hardcoded default. You can change it
by setting the environment variable `SERVER_PROXY_HOSTNAME`. E.g.

```bash
SERVER_PROXY_HOSTNAME=192.168.1.123:8000
```
