---
title: A Test Introduction to CSS layout
slug: Learn/CSS/CSS_layout/Introduction
tags:
  - Article
  - Beginner
  - CSS
  - Floats
  - Grids
  - Introduction
  - Layout
  - Learn
  - Positioning
  - Tables
  - flexbox
  - flow
---
{{LearnSidebar}}

<!--
Embed some of the live samples from different pages. This tests that
the code can handle a mix of live samples, some from the page itself,
and some from other pages.
-->

## Flexbox

{{ EmbedLiveSample('Flex_1', '300', '200', "", "Learn/CSS/CSS_layout/Introduction/Flex") }}

{{ EmbedLiveSample('Flex_2', '300', '200', "", "Learn/CSS/CSS_layout/Introduction/Flex") }}

## Grid Layout

{{ EmbedLiveSample('Grid_1', '300', '330', "", "Learn/CSS/CSS_layout/Introduction/Grid") }}

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

{{ EmbedLiveSample('Grid_2', '300', '330') }}
