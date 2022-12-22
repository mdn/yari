---
title: <img> tags with style= attribute set
slug: Web/Images/Styled
---
### No flaws

![Mugshot picture](../florian.png)

<figcaption>A perfectly good picture using <code>../florian.png</code> and no <code>style</code></figcaption>

![Screenshot from grand-sibling document](../../foo/screenshot.png)

<figcaption>An image that has <code>style=</code> attribute but no mention of
<code>width</code> in its value.</figcaption>

---

### Flaws all over the shop

![Mugshot picture](../florian.png)

<figcaption>An image that should have its entire <code>style=</code> attribute removed.</figcaption>

![Slightly different 'alt' text](../florian.png)

<figcaption>Same as the one above but with a different <code>alt=</code> attribute.</figcaption>

![Screenshot from grand-sibling document](../../foo/screenshot.png)

<figcaption>An image that has <code>style=</code> attribute but no mention of
<code>width</code> in its value.</figcaption>
