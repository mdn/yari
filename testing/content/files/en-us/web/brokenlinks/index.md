---
title: A page peppered with broken links
slug: Web/BrokenLinks
---
[Nothing wrong with this one](/en-US/docs/Web/Foo)

[Will redirect](/en-US/docs/Web/CSS/dumber "First title")

[Also, make it appear as text too](/en-US/docs/Web/CSS/dumber "Second title")

`/en-US/docs/Web/CSS/dumber`

[Too verbose!](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

[Also, too verbose but with anchor](https://developer.mozilla.org/en-US/docs/Web/API/Blob#Anchor)

[Also, too verbose but with query string](https://developer.mozilla.org/en-US/docs/Web/API/Blob?a=b)

[This should have a suggestion and the suggestion should
keep the `#fragment` on the suggested href.](/en-US/docs/Web/HTML/Element/anchor#fragment)

[Wrong case](/en-us/DOCS/Web/api/BLOB)

[Wrong case with hash](/en-US/docs/glossary/bézier_curve#identifier)

[Correct case with hash](/en-US/docs/Glossary/Bézier_curve#identifier)

[Will not have a suggestion](/en-US/docs/Hopeless/Case)

[Leave me alone! I'm actually external](//www.peterbe.com)

[Link to itself (bad)](/en-US/docs/Web/BrokenLinks)
[Link to itself for anchor (good)](/en-US/docs/Web/BrokenLinks#anchor)
[Link to itself for anchor (good)](#anchor)

[Link to `/contributors.txt`](/en-US/docs/Web/BrokenLinks/contributors.txt) (not a flaw)

[`http://` external link](http://www.mozilla.org)

[A hyperlink you can't run `decodeURI` on](https://www.ecma-international.org/ecma-262/6.0/#sec-get-%typedarray%.prototype.buffer).
This demonstrates the fix in [issue#4109](https://github.com/mdn/yari/issues/4109).
