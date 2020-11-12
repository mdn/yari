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

Below we describe each SPA and this is a work in progress.

## 404

The React component is actually called `<NoMatch>` and it generates a file
called `404.html`.

This page gets used by CloudFront as an "Error page" on the distribution
behavior. That means that when a document can't be found in S3 as a regular
key, it renders this instead.
