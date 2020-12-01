import React from "react";

export function DisplayH2({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id}>
      <Permalink title={title} id={id} />
    </h2>
  );
}

export function DisplayH3({ id, title }: { id: string; title: string }) {
  return (
    <h3 id={id}>
      <Permalink title={title} id={id} />
    </h3>
  );
}

function Permalink({ id, title }: { id: string; title: string }) {
  return (
    <a href={`#${id}`} title={`Permalink to ${title}`}>
      {title}
    </a>
  );
}
