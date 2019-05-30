import React from "react";

const escape = require('escape-html');

function renderSources(example) {
    let rendered = '';

    if (example.sources.html) {
        rendered += '<h4>HTML</h4>';
        rendered += `<pre><code>${escape(example.sources.html)}</code></pre>`;
    }

    if (example.sources.css) {
        rendered += '<h4>CSS</h4>';
        rendered += `<pre><code>${escape(example.sources.css)}</code></pre>`;
    }

    if (example.sources.js) {
        rendered += '<h4>JavaScript</h4>';
        rendered += `<pre><code>${escape(example.sources.js)}</code></pre>`;
    }

    return rendered;
}

function renderLiveSample(example) {

    const srcdoc =
`<html>
  <head>
      <meta charset="utf-8">
      <style type="text/css">${example.sources.css}</style>
      <title>${example.description.title}</title>
  </head>
  <body>${example.sources.html}
      <script>${example.sources.js}</script>
  </body>
</html>`;

    const iframe =
`<iframe class="live-sample-frame sample-code-frame" id="frame_Live_example"
    srcdoc="${escape(srcdoc)}"
    width="${example.description.width}px"
    height="${example.description.height}px"
    frameborder="0">
</iframe>`;

    return `<h4>Result</h4>${iframe}`;
}

function renderExample(example) {
    let rendered = '';

    if (example.description.title) {
        rendered += `<h3>${escape(example.description.title)}</h3>`;
        rendered += example.description.content;
    }

    rendered += renderSources(example);

    if (example.description.width) {
        rendered += renderLiveSample(example);
    }

    return rendered;
}


export function Examples(name, documentJSON) {
  let rendered = '<h2>Examples</h2>';
  for (let example of documentJSON.examples) {
      rendered += renderExample(example);
  }
  return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
}
