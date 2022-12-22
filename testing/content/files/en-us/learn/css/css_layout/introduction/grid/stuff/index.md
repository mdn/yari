---
title: Stuff for Grid Layout
slug: Learn/CSS/CSS_layout/Introduction/Grid/Stuff
tags:
  - Stuff
  - Beginner
  - CSS
  - Grids
  - Introduction
  - Layout
  - Learn
---
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
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 100px 100px;
    grid-gap: 10px;
}
```

```html
<div class="wrapper">
    <div class="box1">One</div>
    <div class="box2">Two</div>
    <div class="box3">Three</div>
    <div class="box4">Four</div>
    <div class="box5">Five</div>
    <div class="box6">Six</div>
</div>
```

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
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 100px 100px;
    grid-gap: 10px;
}

.box1 {
    grid-column: 2 / 4;
    grid-row: 1;
}

.box2 {
    grid-column: 1;
    grid-row: 1 / 3;
}

.box3 {
    grid-row: 2;
    grid-column: 3;
}
```

```html
<div class="wrapper">
    <div class="box1">One</div>
    <div class="box2">Two</div>
    <div class="box3">Three</div>
</div>
```

<!--
The following macro calls create the conditions necessary for
duplicate, repeating flaws.
-->

{{ doesnotexist() }}

{{ Page("/en-us/docs/does/not/exist") }}
