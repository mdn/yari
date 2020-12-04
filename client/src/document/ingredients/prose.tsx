import React from "react";

import { DisplayH2, DisplayH3 } from "./utils";

export function Prose({ section }) {
  return <div dangerouslySetInnerHTML={{ __html: section.content }} />;
}

export function ProseWithHeading({ id, section }) {
  return (
    <>
      {section.isH3 ? (
        <DisplayH3 id={id} title={section.title} />
      ) : (
        <DisplayH2 id={id} title={section.title} />
      )}
      <Prose section={section} />
    </>
  );
}
