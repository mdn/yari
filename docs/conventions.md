# Code Conventions

## Formatting

We completely outsource questions of formatting to
[Prettier](https://prettier.io/), which frees us to bikeshed about other things
instead. It is run both as a pre-commit hook and also in CI, denying any PRs
which do not adhere to its formatting.

## Naming

- camelCase for everything
  - except for constants which are all caps snake case (e.g. `CONTENT_ROOT`)
- abbreviations in all caps (e.g. `JSON.parse`, `findByURL`) unless they are the
  start of a variable, then it's all lower case (e.g. `let url = 'earl';`)

## Code Structure

Things should be defined in order in which they are used. E.g.:

```javascript
import dependency from "dependency";

function doThing() {
  // ...
}

function useDoThing() {
  dependency();
  doThing();
}
```
