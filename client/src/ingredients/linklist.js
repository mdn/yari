import React from "react";
import { Link } from "@reach/router";

export function LinkList({ title, content }) {
  if (!content.length) {
    throw new Error(`LinkList with an empty list of links (${title})`);
  }
  return (
    <>
      <h2>{title}</h2>
      <dl>
        {content.map(link => {
          return (
            <React.Fragment key={link.uri}>
              <dt>
                <Link to={link.uri}>{link.short_title || link.title}</Link>
              </dt>
              {link.short_description && <dd>{link.short_description}</dd>}
            </React.Fragment>
          );
        })}
      </dl>
    </>
  );
}
