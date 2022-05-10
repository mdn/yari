# Kumascript in Yari

## Signaling macro deprecation

If a macro should no longer be used and is marked for removal, add the following
to the top of the relevant macro:

```js
// Throw a MacroDeprecatedError flaw
mdn.deprecated();
```

It is also useful to add a code comment to the macro detailing what the blockers
are for removal. See the following pull request for reference:
[Deprecate the {{index}} macro](https://github.com/mdn/yari/pull/5607)
