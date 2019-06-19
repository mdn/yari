import React from "react";

function slugifyTitle(title) {
  return title.toLowerCase().replace(/ /gi, "_");
}

function RenderSources({ sources }) {
  return (
    <>
      {sources.html && <h4>HTML</h4>}
      {sources.html && (
        <pre>
          <code>{sources.html}</code>
        </pre>
      )}

      {sources.css && <h4>CSS</h4>}
      {sources.css && (
        <pre>
          <code>{sources.css}</code>
        </pre>
      )}

      {sources.js && <h4>JavaScript</h4>}
      {sources.js && (
        <pre>
          <code>{sources.js}</code>
        </pre>
      )}
    </>
  );
}

function RenderLiveSample({ example }) {
  const srcdoc = `<html>
  <head>
      <meta charset="utf-8">
      <style type="text/css">${example.sources.css}</style>
      <title>${example.description.title}</title>
  </head>
  <body>${example.sources.html}
      <script>${example.sources.js || ""}</script>
  </body>
</html>`;
  return (
    <>
      <h4>Result</h4>
      <iframe
        className="live-sample-frame"
        srcDoc={srcdoc}
        title={example.description.title || "Live sample"}
        width={example.description.width}
        height={example.description.height}
        frameBorder={0}
      />
    </>
  );
}

function RenderExample({ example }) {
  return (
    <>
      {example.description.title && <h3>{example.description.title}</h3>}

      {example.description.content && (
        <div
          dangerouslySetInnerHTML={{ __html: example.description.content }}
        />
      )}

      <RenderSources sources={example.sources} />

      {/* At the moment the author implicitly signals that an example is live
        by including width and height values for the iframe */}
      {example.description.width && <RenderLiveSample example={example} />}
    </>
  );
}

export function Examples({ document }) {
  return (
    <>
      <h2>Examples</h2>
      {document.examples.map((example, i) => (
        <RenderExample key={example.description.title + i} example={example} />
      ))}
    </>
  );
}
