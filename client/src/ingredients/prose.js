import React from "react";

export function Prose({ section }) {
  return <div dangerouslySetInnerHTML={{ __html: section.content }} />;
}

export function ProseWithHeading({ id, section }) {
  if (!id) {
    id = section.title.replace(/\s+/g, "_").trim();
  }
  return (
    <>
      <h2 id={id}>{section.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: section.content }} />
    </>
  );
}
