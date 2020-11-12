# Single Page Apps

Single Page Apps (aka SPAs) are pages that we render, that are _not_ documents.
For example the `404` page. These are rendered with server-side rendered but
without a "doc".

To build these you run:

```sh
yarn build --spas-only
```

By default, running only `yarn build` will build all documents _and_ all SPAs.
You can also opt to _not_ build them and only build the documents. To do that use:

```sh
yarn build --no-spas
```

The SPAs are also built when run `yarn prepare-build` or `yarn start`.

Below we describe each SPA and this is a work in progress.

## 404 - Page not found

The React component is actually called `<NoMatch>` and it generates a file
called `404.html`.

This page gets used by CloudFront as an "Error page" on the distribution
behavior. That means that when a document can't be found in S3 as a regular
key, it renders this instead.

To debug the 404 page, in local development you have two choices:

- [http://localhost:5000/en-US/docs/Does/not/exist](http://localhost:5000/en-US/docs/Does/not/exist)

- [http://localhost:3000/en-US/\_404/Does/not/exist](http://localhost:3000/en-US/_404/Does/not/exist)

The latter is used so you get hot-reloading as you're working on it. This will only
work when you do local development on Yari.

## Home page

UNDER DEVELOPMENT. Watch this space!

## Site search

UNDER DEVELOPMENT. What this space!

## Sign-up

UNDER DEVELOPMENT. What this space!

## User profile

UNDER DEVELOPMENT. What this space!
