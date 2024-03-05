---
title: <img> tag with src that isn't a valid image
slug: Web/Images/Bad_src
---

<!-- resolves, intially, to a directory -->
![](/en-us/web)

<!-- actually isn't a valid PNG -->
![](actuallynota.png)

<!--
is a zero byte image, and as a check for html in markdown file
add a space at the start of the <img> as a check for image finder function
-->
 <img src="empty.gif" alt=""/>

<!--
multi-line html with broken image,
exists on disk but isn't actually a real SVG file.
-->
<table>
  <tr>
    <td>
      <img src="actuallynota.svg" alt="broken image" />
    </td>
  </tr>
</table>
