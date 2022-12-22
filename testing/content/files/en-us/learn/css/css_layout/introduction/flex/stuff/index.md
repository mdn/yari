---
title: Stuff for CSS Flex layout
slug: Learn/CSS/CSS_layout/Introduction/Flex/Stuff
tags:
  - Stuff
  - Beginner
  - CSS
  - Introduction
  - Layout
  - Learn
  - flexbox
---

## Examples

### Flexbox Example 1

```css hidden
* {box-sizing: border-box;}

.wrapper > div {
    border-radius: 5px;
    background-color: rgb(207,232,220);
    padding: 1em;
}

```

```css
.wrapper {
  display: flex;
}
```

```html
<div class="wrapper">
  <div class="box1">One</div>
  <div class="box2">Two</div>
  <div class="box3">Three</div>
</div>
```

### Flexbox Example 2

```css hidden
    * {box-sizing: border-box;}

    .wrapper > div {
        border-radius: 5px;
        background-color: rgb(207,232,220);
        padding: 1em;
    }

```

```css
.wrapper {
    display: flex;
}

.wrapper > div {
    flex: 1;
}
```

```html
<div class="wrapper">
    <div class="box1">One</div>
    <div class="box2">Two</div>
    <div class="box3">Three</div>
</div>
```
