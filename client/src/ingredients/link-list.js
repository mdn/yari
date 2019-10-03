import React from "react";
import { Link } from "@reach/router";

export function LinkList({ title, links }) {
  return (
    <div className="link-list">
      <h2>{title}</h2>
      <dl>
        {links.map(link => (
          <React.Fragment key={link.mdn_url}>
            <dt>
              <Link to={link.mdn_url}>{link.short_title || link.title}</Link>
            </dt>
            {link.short_description && (
              <dd
                dangerouslySetInnerHTML={{ __html: link.short_description }}
              />
            )}
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}
