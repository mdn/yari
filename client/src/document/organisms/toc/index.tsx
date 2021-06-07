import React from "react";

import { Toc } from "../../types";

import "./index.scss";

export function TOC({ toc }: { toc: Toc[] }) {
  const [showTOC, setShowTOC] = React.useState(false);

  return (
    <aside className="document-toc-container">
      <section className="document-toc">
        <header>
          <h2>Table of contents</h2>
          <button
            type="button"
            className="ghost toc-trigger-mobile"
            onClick={() => {
              setShowTOC(!showTOC);
            }}
            aria-controls="toc-entries"
            aria-expanded={showTOC}
          >
            Table of contents
          </button>
        </header>
        <ul id="toc-entries" className={showTOC ? "show-toc" : undefined}>
          {toc.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id.toLowerCase()}`}
                dangerouslySetInnerHTML={{ __html: item.text }}
              ></a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
