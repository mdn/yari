# Unarchiving mdn content

This guide explains the steps required to unarchive some content, that is,
making the archived content banner disappear form the top of the page(s) and
moving their source files from the [archived-content](https://github.com/mdn/archived-content)
repo to the [content](https://github.com/mdn/content) repo so they can be
edited freely.

Moving them over is not as simple as just copying the source directories over —
there is a specialized tool available in the `yari` repo that puts everything
in the right place — `unarchive`, which you'll learn about below.

## Preparing to unarchive

- First of all fork and locally clone the `yari`, `content`, and
  `archived-content` repos. You'll also need to fork and locally clone the
  [translated-content-rendered](https://github.com/mdn/translated-content-rendered/)
  repo for now, even if you are not touching any localized content. If you
  already have some of them cloned locally, make sure they are up-to-date
  (e.g. `fetch` the updated content from the origin repos).
- Install the latest toolset in the `yari` repo using `yarn install`.
- Create new branches in the `content` and `archived-content` repos, and check
  them out locally.
- `cd` into your `yari` repo.

### Adding the right environment variables to yari

Make sure to add the absolute path to your `content` and `archived-content`
repos' `files` directories to the `CONTENT_ROOT` and `CONTENT_ARCHIVED_ROOT`
environment variables. You'll also need to set the `CONTENT_TRANSLATED_ROOT` env
variable's value to the path to the `translated-content-rendered` repo's
`files` directory.

The best way to do this is by setting those values in an `.env` file inside your
`yari` repo.

This can be done by running the following lines inside the root of the yari
directory:

```bash
echo 'CONTENT_ROOT=/path/to/content/files' >> .env
echo 'CONTENT_ARCHIVED_ROOT=/path/to/archived-content/files' >> .env
echo 'CONTENT_TRANSLATED_ROOT=/path/to/translated-content-rendered/files'
 >> .env
```

Note: If an `.env` file does not already exist, it will be created by the first of
the above lines.

## Using the unarchive tool

Now you can use the `unarchive` tool to move the chosen content correctly out of
the `archived-content` repo, and in to the `content` repo.

You can unarchive a tree of documents using the following command — this is what
you'll most commonly want to do:

```bash
yarn tool unarchive --foldersearch relative/url/fragment --move
```

- `--foldersearch` finds the pages you want to move by matching the end of their
  directory path, and moves them over to the `content` repo, in the correct
  format.
- `--move` deletes the content from the `archived-content` repo — we want to
  move it in most cases, not have a copy in each repo.

So to move `archived-content/files/content/en-us/mozilla/`
`thunderbird/autoconfiguration` and all its contents over to `content`, we could
do:

```bash
yarn tool unarchive --foldersearch mozilla/thunderbird/autoconfiguration --move
```
