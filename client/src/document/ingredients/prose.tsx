import React from "react";

import { DisplayH2 } from "./utils";

export function Prose({ section }) {
  return <div dangerouslySetInnerHTML={{ __html: section.content }} />;
}

export function ProseWithHeading({ id, section }) {
  return (
    <>
      <DisplayH2 id={id} title={section.title} />
      <Prose section={section} />
    </>
  );
}
