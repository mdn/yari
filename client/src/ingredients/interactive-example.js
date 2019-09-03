import React from "react";

export function InteractiveExample({ document, src }) {
  if (!src || typeof src !== "string") {
    throw new Error("'src' must be truthy and a string");
  }
  return (
    <div>
      <iframe
        title={`Interactive example for ${document.title}`}
        className="interactive-example"
        frameBorder={0}
        height={450}
        src={src}
        width="100%"
      />
    </div>
  );
}
