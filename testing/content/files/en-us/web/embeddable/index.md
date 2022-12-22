---
title: Embed live sample with and without name
slug: Web/Embeddable
---
This page used the `EmbedLiveSample` but the text isn't identical to what the ID would become.

<div class="hidden"><!--
    In Kumascript if you were to slugify "ColorPicker tool" it would
    become `ColorPicker_tool` which is different from `ColorPicker_Tool`
    which is the ID used and the ID referred to in the EmbedLiveSample macro.
  --><h2 id="ColorPicker_Tool">ColorPicker tool</h2><h3 id="HTML">HTML</h3><pre class="brush: html">   
    &#x3C;hr/>
  </pre><h3 id="CSS">CSS</h3><pre class="brush: css">  hr {
    margin: 20px; padding: 10px;
    border-top: 3px solid pink;
    border-right: 3px solid magenta;
    border-bottom: 3px solid blue;
    border-left: 3px solid maroon;
  }
  </pre></div>

This `EmbedLiveSample` refers to a `id` attribute.

{{ EmbedLiveSample('ColorPicker_Tool', '100%', '70') }}

---

```html hidden
   
  <meter id="fuel"
       min="0" max="100"
       low="33" high="66" optimum="80"
       value="50">
    at 50/100
  </meter>

```

```css hidden
    meter {
      margin: 20px;
    }

```

This `EmbedLiveSample` refers to a `name` attribute.

{{ EmbedLiveSample('Meter', '100%', '70') }}

---

```html hidden
   
    <kbd>Ctrl</kbd>

```

```css hidden
    kbd {
      background-color: #eee;
      background-color: #eee;
      border-radius: 3px;
      border: 1px solid #b4b4b4;
      box-shadow: 0 1px 1px rgba(0, 0, 0, .2), 0 2px 0 0 rgba(255, 255, 255, .7) inset;
      font-family: monospace;
      padding: 0 2px;
      word-wrap: break-word;
    }

```

This `EmbedLiveSample` refers to what it knows the
`id` attribute will become.

{{ EmbedLiveSample('Keyboard', '100%', '70') }}
