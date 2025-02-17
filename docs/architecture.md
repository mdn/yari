# Yari architecture

## Modes

### Production

This is how we ship the site, as static files served through a CDN with sensible
caching. It allows for viewing and searching through documents.\
This mode needs to optimize for quick response times and small page sizes and
can do so at the expense of longer build times.

### Local

This is how writers interact with our content. It runs locally on a writer's
machine and behaves similarly to production URL structure and appearance.\
In this mode we optimize for being able to quickly see documents after starting
the server or making changes. We can have larger page sizes as they are served
locally.

## Modules

The codebase is subdivided into multiple different modules. These are the
modules, ordered from least to most interdependencies, meaning **content** has
no dependencies on other internal modules, while **testing** depends on all of
them:

### content

Through it you gain access to reading and manipulating our source of truth, the
documents, and their related data like redirects which all are persisted on
disk. It also exports a number of utility functions, needed both internally and
by various other modules.\
There is no CLI for it and it can only be consumed programmatically.

### import

A parameterizable command line script for importing MySQL kuma wiki documents.
They are turned into separate files per document, using the **content** module.
Once Yari is running in production, and it has become the source of truth for
MDN's content management we will delete this module.

### kumascript

A copy of the kumascript repo, with modifications made so that it can fetch
whatever data it needs from **content**. It exposes functions for expanding
kumascript macros and rendering live sample pages.

### client

All the view code for viewing and searching through documents, as well as
viewing **kumascript** related problems and creating, updating and deleting
documents.

### ssr

Fixes syntax highlighting and URLs for a given rendered document and then
statically renders it using the **client**'s view code.

### build

This module serves two main purposes:

1. An exported function to turn a document from **content** into one that can be
   later used by **client** to render out a whole page, which includes
   **kumascript** rendering, breadcrumb data retrieval and collecting associated
   flaws.
2. A CLI for rendering out all the requested documents using both the above
   described function, and the **ssr** code.

### server

A server used for development and testing, which simulates how the static file
serving in production would work but also provides local-mode specific
functionalities for modifying content and maintaining a dynamic _search index_.
Instead of serving static files it builds and renders documents just-in-time
when they are requested, using the **build** module.

### testing

Tests for the surface area of Yari (aka integration tests) which includes
viewing, searching and modifying documents.

## Alternatives

Previously we have implemented this with an index of the entire content at the
core of Yari. This had multiple upsides:

1. Lookup of documents did not necessitate them their file path being derivable
   from their URL. This especially applied to stumptown documents.
2. During the indexing phase various other hard-to-lookup fields could be
   populated like the list of translated documents.
3. The index also served as a cache, making successive lookups cheaper.

Despite that we decided to go with the architecture outlined above for the
following reasons:

1. All the lookups essential to porting MDN content over to Yari can be done in
   a reasonable time, without an index, for both production and local-mode.
2. Thus, the code complexity introduced through the shared index data structure
   which also needs to be updated in local-mode, did not justify its existence.
3. While an index is still needed for searching documents and receiving
   notifications about recent changes, it can be cleanly isolated.
4. No caching means no code nor bugs for cache invalidation.
