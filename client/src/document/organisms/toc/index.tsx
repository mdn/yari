import React, { useEffect, useState } from "react";

import "./index.scss";
import { Toc } from "../../types";
import { useDebouncedCallback } from "use-debounce";

export function TOC({ toc }: { toc: Toc[] }) {
  const [currentViewedTocItem, setCurrentViewedTocItem] = useState(
    toc[0].id.toLowerCase()
  );

  const getCurrentHighlightedSectionId = () => {
    const offsetY = window.scrollY;
    if (offsetY < window.innerHeight * 0.1) {
      setCurrentViewedTocItem(toc[0].id.toLowerCase());
      return;
    }

    const headings = toc.map((item) =>
      document.getElementById(item.id.toLowerCase())
    );
    let currentSectionId;

    headings.forEach((section) => {
      const posY = section?.offsetTop;
      if (posY && posY < offsetY + window.innerHeight * 0.1) {
        currentSectionId = section.id;
      }
    });

    if (currentSectionId && currentSectionId !== currentViewedTocItem) {
      setCurrentViewedTocItem(currentSectionId);
    }
  };

  const debouncedGetCurrentHighlightedSectionId = useDebouncedCallback(
    getCurrentHighlightedSectionId,
    25
  );

  useEffect(() => {
    window.addEventListener("scroll", debouncedGetCurrentHighlightedSectionId);
    return () => {
      window.removeEventListener(
        "scroll",
        debouncedGetCurrentHighlightedSectionId
      );
    };
  }, [debouncedGetCurrentHighlightedSectionId]);

  return (
    <aside className="document-toc-container">
      <section className="document-toc">
        <header>
          <h2 className="document-toc-heading">In this article</h2>
        </header>
        <ul className="document-toc-list" id="toc-entries">
          {toc.map((item) => {
            return (
              <TOCItem
                key={item.id}
                id={item.id}
                text={item.text}
                sub={item.sub}
                currentViewedTocItem={currentViewedTocItem}
              />
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

function TOCItem({
  id,
  text,
  sub,
  currentViewedTocItem,
}: Toc & { currentViewedTocItem: string }) {
  return (
    <li className={`document-toc-item ${sub ? "document-toc-item-sub" : ""}`}>
      <a
        className="document-toc-link"
        key={id}
        aria-current={currentViewedTocItem === id.toLowerCase() || undefined}
        href={`#${id.toLowerCase()}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </li>
  );
}
