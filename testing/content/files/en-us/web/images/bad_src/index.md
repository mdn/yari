---
title: <img> tag with src that isn't a valid image
slug: Web/Images/Bad_src
---
<!-- exists on disk but isn't actually a real SVG file. -->

![](actuallynota.svg)

<!-- resolves, intially, to a directory -->

![](/en-us/web)

<!-- actually isn't a valid PNG -->

![](actuallynota.png)

<!-- is a zero byte image -->

![](empty.gif)
