import React from "react";

export function InteractiveExample({ document }) {
  return (
    <div>
      <iframe
        title={`Interactive example for ${document.title}`}
        className="interactive-example"
        frameBorder={0}
        height={450}
        src={document.interactive_example_url}
        width="100%"
      />
    </div>
  );
}
