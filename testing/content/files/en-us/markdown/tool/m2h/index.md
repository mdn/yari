---
title: This is a test page
slug: Markdown/Tool/M2H
tags:
  - Tag1
---

This page is for testing the m2h tool. It's going to concentrate on areas where we implement custom stuff on top of the GFM conversion which is handled by Unified.

## Hello

Let's test some Markdown.

## Definition lists

We have our own syntax for `<dl>`.

- a term
  - : a definition
- another term
  - : another definition

    Definitions can include block elements:

    ```js
    const suchAsCodeBlocks = true;
    ```

    And of course `<dl>` elements can be nested inside `<dd>`:

    - a nested term
      - : a definition
    - another nested term
      - : another nested definition

Our `<dl>` syntax does not support multiple `<dd>` elements for a single `<dt>`:

- so this
  - : will look
  - : like a weird list

## Callouts, notes, and warnings

> **Note:** This should be a note.

> **Note:**
>
> This should **also** be a note.

> **Note:** Notes can have block elements, like:
>
> ```js
> const codeBlocks = true;
> ```
>
> ...and lists
>
> - of things
> - and more things
>
> ...and even definition lists:
>
> - with terms
>   - : that have definitions
> - and more terms
>   - : and as usual, the definitions can include block elements:
>     ```css
>     .likeCodeBlocks {
>     }
>     ```

> Note: But if the node isn't quite properly formatted,
> it will just look like a blockquote.

> **Warning:** This should be a warning.

> **Callout:**
>
> This should be a callout

> **Callout:** This should also be a callout.

> **Callout:**
>
> #### Callouts can have headings, like notes and warnings
> (Although that's not very good practice.)

## Code blocks

We support syntax highlighting of course, and a couple of other special features.

```js
const language = "js";
console.log(`Look at this lovely ${language}!`);
```

You can hide code blocks:

```css hidden
div.youCantSeeMe: {
}
```

And show good and bad practice:

```js example-bad
eval(evilCode);
```

```js example-good
console.error(evilCode);
```

## Tables

We support standard GFM table syntax:

| Heading 1 | Heading 2 | Heading 3 |
|-----------|-----------|-----------|
| cell 1    | cell 2    | cell 3    |
| cell 4    | cell 5    | cell 6    |

Technically we also support:

Heading 1 | Heading 2 | Heading 3
 --- | --- | ---
cell 1    | cell 2    | cell 3
cell 4    | cell 5    | cell 6

...but it's not allowed.

## Raw HTML

Of course you can use raw HTML for anything. For instance if you really need two definitions for one term:

<dl>
  <dt>term</dt>
  <dd>definition1</dd>
  <dd>definition2</dd>
</dl>

...or a table with a header row:

<table>
  <thead>
    <tr>
      <th></th>
      <th>Col 1 heading</th>
      <th>Col 2 heading</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Row 1 heading</th>
      <td>Toucan</td>
      <td>Rattlesnake</td>
    </tr>
    <tr>
      <th scope="row">Row 2 heading</th>
      <td>Echidna</td>
      <td>Ostrich</td>
    </tr>
  </tbody>
</table>

We especially use inline raw HTML for things like<sub>sub</sub> or<sup>sup</sup> and also <kbd>\<kbd\></kbd>.
