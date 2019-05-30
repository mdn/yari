import React from "react";

export function InteractiveExample(name, documentJSON) {
  let rendered = `<div><iframe class="interactive tabbed-standard" frameborder="0" height="450" src="${documentJSON.interactive_example_url}" width="100%"></iframe></div>`;

  return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
}
