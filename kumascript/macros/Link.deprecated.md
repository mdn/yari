# `{{ link }}` deprecated

The Link macro has [been deprecated](https://github.com/mdn/yari/pull/6865) and
should no longer be used. Any occurances that still exist in actively maintained
content should be replaced with a plain Markdown style link.

## How to replace the macro

A common usage of the macro is as follows:

```js
The {{Link("/en-US/docs/Web/JavaScript/Guide")}} on MDN
```

This can be replaced with the following Markdown:

```md
The [JavaScript Guide](/en-US/docs/Web/JavaScript/Guide) on MDN
```

The text for the link matches the title of the page it links to.
