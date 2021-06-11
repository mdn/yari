# Proxying to Kuma in local development

## Quickstart

Suppose you're working on a feature, in Yari, where you want to make use
of API responses in a local Kuma. The quickest way to accomplish this is as follows:

1. In one terminal `cd /path/to/kuma` to your Kuma directory
   1. Open `.env` and append this line: `ADDITIONAL_NEXT_URL_ALLOWED_HOSTS=localhost.org:3000`
   1. Start `docker-compose up`
1. In another terminal, edit the root `.env` file and...
   - put in the line: `HOST=localhost.org`
   - put in the line: `REACT_APP_KUMA_HOST=localhost.org:8000`
1. Now use <http://localhost.org:3000>

**Note!** You have to use <http://localhost.org:3000> (note the extra `.org`)
and not the usual <http://localhost:3000> so the browser sends your "Kuma cookie".

**Note!** When you edit your root `.env` file, you need to stop `yarn dev`
and start it up again.

## Logging in

[See Siging in and signing up](./signingin.md)

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
  "is_subscriber": true
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
to our Yari server (`localhost:5000`) which in turn picks this up and proxies,
it leaving the request untouched, but essentially only changes the host name.

So a request for `http://localhost:3000/api/v1/whoami` goes from your browser
to `http://localhost:5000/api/v1/whoami` (via Node) proxies it on to
`http://localhost.org:8000/api/v1/whoami`. All along, any cookie tied
to `localhost.org` is automatically appended to the request.

Note that the proxying is **hardcoding** the host (not to be confused with
"host name" which includes the port number) `localhost.org:8000` and that's
how it knows. But this value is only a hardcoded default. You can change it
by setting the environment variable `REACT_APP_KUMA_HOST`. E.g.

```bash
REACT_APP_KUMA_HOST=192.168.1.123:8000
```
