---
title: A page peppered with images
slug: Web/Images
---
### No flaws

![Mugshot picture](florian.png)

<figcaption>A perfectly good picture using <code>florian.png</code></figcaption>

![Mugshot picture](./florian.png)

<figcaption>A perfectly good picture using <code>./florian.png</code></figcaption>

![Screenshot of an app](https://www.peterbe.com/static/images/howsmywifi-scr.png)

<figcaption>A remote URL with <code>https://</code></figcaption>

![Screenshot from sibling document](../foo/screenshot.png)

<figcaption>An image in a sibling document using <code>../foo/screenshot.png</code></figcaption>

---

### Flaws all over the shop

![Deliberately not working image](idontexist.png)

<figcaption>An image reference that doesn't exist on disk</figcaption>

![Mugshot picture](/en-US/docs/Web/Images/florian.png)

<figcaption>An overly verbose reference to image using <code>/en-US/docs/Web/Images/florian.png</code></figcaption>

![Mugshot picture](Florian.PNG)

<figcaption>Valid picture reference but wrong cASe <code>Florian.PNG</code></figcaption>

![Tiny mugshot favicon](http://www.peterbe.com/static/images/favicon-32.png)

<figcaption>An external image with a <code>http://</code> protocol</figcaption>

![Devedition logo](https://developer.mozilla.org/en-US/docs/Web/Images/screenshot.png)

<figcaption>An external image with the <code>https://developer.mozilla.org</code> prefix</figcaption>

![Screenshot from sibling document](/en-US/docs/Web/Foo/screenshot.png)

<figcaption>An image in a sibling document unnecessarily verbose</figcaption>

![Screenshot from sibling document](../Foo/nonexistent.png)

<figcaption>An image in a sibling document that doesn't exist</figcaption>

Also, make a link to an image: [Open the picture](/en-US/docs/Web/Images/florian.png)
