# NPM Releases

In essence, every commit to `main` triggers a new build which gets published on
[npmjs.com as `@mdn/yari`](https://www.npmjs.com/package/@mdn/yari).

## Why we are doing this

The idea is that the content repo needs Yari to start a previewing server so you
can see your changes, on your laptop, as you make them. But we can't put all of
Yari and all the content in the same repo because of security.

The content is less monitored for security risks and the source code (i.e. Yari)
is highly monitored and contains a lot more power. The split means we can enable
very different continuous integration checks as the contexts are different. For
example, we run unit tests when dependencies change only on the code.

Another reason for the split is the separation of concerns. This way, the
repository for the source code (again, i.e. Yari) can have issues and PRs
exclusively about the functionality for maintenance and for development. Whereas
the repository for the content can be exclusively about the content.

## Version numbers

First of all, the version numbers don't matter. We're basically using NPM
releases instead of relying on `git submodule` because tools like `npm` is
easier to use.

For every commit to `main` our GitHub Action for NPM publishing will make a
patch release. I.e. from `0.9.1` to `0.9.2`. This will happen no matter how
trivial the `main` commit changeset is.

If you want to trigger a release with minor increment (i.e. from `0.9.2` to
`0.10.0`) you make a commit with a message that contains the prefix
`feature: ...` or `feat: ...`.

If you want to trigger a release with a major increment (i.e. from `0.9.2` to
`1.0.0`) you make a commit with a message that contains the string
`BREAKING CHANGE`.

## Food for future thought

We might want to consider something like
[`release-please`](https://github.com/googleapis/release-please) will instead
create a PR about making a new version. That would slow down the NPM releases
but maybe that's better if too many commit messages cause too many releases.
