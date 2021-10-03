# Single Page Apps

Single Page Apps (aka SPAs) are pages that we render, that are _not_ documents.
For example the `404` page. These are rendered server-side but without a "doc".

To build these you run:

```sh
yarn tool spas
```

The SPAs are also built when running `yarn prepare-build` or `yarn start`.

Below we describe each SPA and this is a work in progress.

## 404 - Page not found

The React component is actually called `<PageNotFound>` and it generates a file
called `404.html`.

This page gets used by CloudFront as an "Error page" on the distribution
behavior. That means that when a document can't be found in S3 as a regular
key, it renders this instead.

To debug the 404 page, in local development you have two choices:

- <http://localhost:5000/en-US/docs/Does/not/exist>

- <http://localhost:3000/en-US/_404/Does/not/exist>

The latter is used so you get hot-reloading as you're working on it. This will only
work when you do local development on Yari.

## Home page

UNDER DEVELOPMENT. Watch this space!

## Site search

UNDER DEVELOPMENT. Watch this space!

## Sign-up

UNDER DEVELOPMENT. Watch this space!

## User profile

UNDER DEVELOPMENT. Watch this space!
