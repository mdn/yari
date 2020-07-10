import React, { useState } from "react";
import { useGA } from "../ga-context";

import { Toc } from "./types";
import Caret from "../kumastyles/arrows/caret-down.svg";

export function TOC({ toc }: { toc: Toc[] }) {
  const ga = useGA();
  const [showTOC, setShowTOC] = useState(false);

  /**
   * Send a signal to GA when the user clicks on one of links
   * in the table of contents
   */
  function sendTOCClicks(event: React.MouseEvent) {
    if (event.target instanceof HTMLAnchorElement) {
      const action = event.target.textContent;
      const label = new URL(event.target.href).hash;
      ga("send", {
        hitType: "event",
        eventCategory: "MozMenu",
        eventAction: action,
        eventLabel: label,
      });
    }
  }

  return (
    <aside className="document-toc-container">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <section className="document-toc" onClick={sendTOCClicks}>
        <header>
          <h2>On this Page</h2>
          <button
            type="button"
            className="toc-trigger-mobile"
            onClick={() => {
              setShowTOC(!showTOC);
            }}
          >
            Jump to section
            <img src={Caret} alt="Caret" />
          </button>
        </header>
        {showTOC && (
          <ul className="show-toc">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.text}</a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
