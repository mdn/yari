# Functional tests

This is a workspace dedicated to simulating all of Yari but with a
fixed set of content files.

Unlike testing the real content, this content "never changes". I.e. we
control it and know exactly what to expect to find.

The general idea is that you run the same build commands as regular
Yari but you point it to a different "content root" and then we run
tests (using `jest`) on what got built.

This way we can trigger specific `kumascript` macros and other effects
and know exactly what it should have become.

## Local development

When hacking on the functional tests it's important that you can do
this _without_ continuous integration (CI). That way you don't need to
wait for CI to run your every commit in a pull request (PR).

Also, you can start the full development environment with:

```bash
yarn start:functional
```

That will start the `watcher` (long-running), the `server` (Express
serve on `localhost:5000`), and the client (`create-react-app` on
`localhost:3000`).
To test it go to:
[http://localhost:3000/en-US/docs/Web/Foo](http://localhost:3000/en-US/docs/Web/Foo)
for example.

Now you should be able to make edits and notice automatic reloading.
But remember to unstage edits, otherwise it might break the automated
test suite.

To run the `jest` test suite:

```bash
yarn workspace testing run test
```

This assumes you've set the appropriate environment variables and built the
content. Alternatively, you can run `./testing/scripts/functional-test.sh`
which takes care of all of these things.

## Conditional testing in CI

In GitHub Actions, instead of trying to optimize certain tests, just skip
them if none of the files that affect the tests have changed.

One such example is the tests for the `kumascript` source code plus macros.
Use this technique heartly to speed up the continous integration.

## Caveats

- At the moment it might not work on Windows. It should. At least the "Local
  development"
- It's not testing the built HTML with a headless browser. It should.
- We should put all known `kumascript` macros in some form. At least the ones
  intend to support.
- There is no guidelines for how to add tests but feel free to pile on
  sample pages. You should not be afraid to add more.

## Debugging headless tests

TO BE CONTINUED
