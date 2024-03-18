# Google Analytics

We use Google Analytics for counting pageviews and for sending arbitrary events
from the client-side code. The way it works is that you have to send an
environment variable, like:

```bash
BUILD_GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXX
```

and that gets included in the build by more or less code-generating the snippet
we use to set up Google Analytics.

By default, it's not set and that means no Google Analytics JavaScript code
inside the rendered final HTML. By setting the environment variable, a
build-step will generate a `/static/js/gtag.js` file that configures how we
enable Google Analytics. And the server-side rendering will inject a
`<script defer src=/static/js/gtag.js>` in the HTML of every page, including
home page, site-search, `404.html` and article pages.

## Debugging

See:
[Troubleshooting with Tag Assistant](https://support.google.com/tagassistant/answer/10039345)

## Sending events

You can send individual arbitrary events in the client-side code. The best way
to describe how this works is to look a existing code.

Look for code that uses the `const { gtag } = useGA()` hook and things that
start with...:

```javascript
gtag("event", {
  ...
```

It's harmless to do. The underlying code will automatically do nothing if the
Google Analytics code isn't loaded in to the `window` global so you don't need
to wrap you send events with a conditional statement.

## Client-side navigation

By default, we send a `pageview` event as soon as the `gtag.js` and the
`https://www.google-analytics.com/analytics.js` code have both loaded. This
should happen as early as possible. Even before the `DOMContentLoaded` DOM
event. But we do use some client-side navigation and that will trigger a new
pageview event. Before that send (or third or fourth etc.) a custom variable is
set. Looks like this:

```javascript
ga("set", "dimension19", "Yes");
ga("send", {
  hitType: "pageview",
  location: window.location.toString(),
});
```
