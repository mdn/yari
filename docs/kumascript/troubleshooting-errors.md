# Troubleshooting KumaScript errors

This article details the four types of KumaScript error, and some steps you can
take to fix them.

## DocumentParsingError

`DocumentParsingError` errors appear when KumaScript has trouble understanding
something in the document itself. The most common cause is a syntax error in a
macro.

Check for:

- Curly braces not meant to call a macro. If you need to write `{` in a document
  without calling a macro you can escape it with a `\` like this: `\\{`.
- Special characters in a macro parameter. If you need to use a `"` or a `\`
  inside of a macro parameter, they can be escaped with a `\` like this: `\\` or
  `\"`.
- Missing commas between macro parameters. Macro parameters need to be delimited
  by a comma (,) but not at the end of the list of parameters; for example
  `{{compat("html.elements.link", 2)}}`.
- HTML tags appearing inside a macro call. If you apply styling to a macro, it
  will often break because, for example, a `</code>` tag may have appeared
  inside the macro code in the source code. Check the source view to see what's
  there, and remove any unnecessary styling.

## TemplateLoadingError

`TemplateLoadingError` errors appear when KumaScript has trouble finding which
macro to include on a page.

Check for misspelled macro names or renamed macros. A list of active macros is
available in [kumascript/macros](../../kumascript/macros).

## TemplateExecutionError

`TemplateExecutionError` errors appear when KumaScript encounters an error in
the macro. If the error persists,
[report an issue](https://github.com/mdn/yari/issues), including the URL of the
page and the text of the error.

## Error & Unknown

This is the category errors end up in if they are not one of the other kinds of
error.
