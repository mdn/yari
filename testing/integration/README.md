# Integration tests

These Python-based tests are meant to test the fully-deployed system from a
black-box point of view, and the goal is to test every public-facing endpoint.
These tests can, of course, be run manually as desired, but I think the plan is
to eventually run these within their own GitHub Action cron workflow. In that
form, they would provide a basic system-check "heartbeat".

## Running the tests

### Stage

To run the integration tests against the stage environment:

```sh
poetry run pytest --base-url https://developer.allizom.org
# or to automatically retry on failures
poetry run pytest --reruns 2 --base-url https://developer.allizom.org
```

### Production

To run the integration tests against the production environment:

```sh
poetry run pytest --base-url https://developer.mozilla.org
# or to automatically retry on failures
poetry run pytest --reruns 2 --base-url https://developer.mozilla.org
```

### Examples of limiting the scope of your test runs

```sh
poetry run pytest --base-url https://developer.allizom.org headless/test_redirects.py
```

```sh
poetry run pytest --base-url https://developer.allizom.org headless/test_redirects.py::test_zone_redirects
```

```sh
poetry run pytest --base-url https://developer.allizom.org headless/test_redirects.py::test_zone_redirects[/ko/Add-ons/]
```

## Formatting the Python test files

```sh
poetry run black .
```

## Linting the Python test files

```sh
poetry run flake8 .
```
