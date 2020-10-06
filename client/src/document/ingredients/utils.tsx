import React from "react";

export function DisplayH2({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id}>
      <a href={`#${id}`} title={`Permalink to ${title}`}>
        {title}
      </a>
    </h2>
  );
}
