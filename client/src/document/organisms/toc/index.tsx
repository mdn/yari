import React, { useState } from "react";

import "./index.scss";
import { Toc } from "../../types";

export function TOC({ toc }: { toc: Toc[] }) {
  const [currentViewedTocItem, setCurrentViewedTocItem] = useState("");

  React.useEffect(() => {
    // Observe headings and siblings.
    const main = document.querySelector("main") ?? document;
    const targets = main.querySelectorAll("h1, h1 ~ *, h2, h2 ~ *, h3, h3 ~ *");

    // Tracks if observed elements are visible (intersection with viewport).
    const intersectionMap = new Map<Element, boolean>();

    // All ids referenced by the TOC.
    const tocIds = toc.map(({ id }) => id);

    // Maps every observed element to an id referenced by the TOC.
    const idMap = new Map<Element, string>();

    /**
     * Updates the visibility of observed elements.
     */
    function manageIntersectionMap(entries: IntersectionObserverEntry[]) {
      for (const entry of entries) {
        intersectionMap.set(entry.target, entry.isIntersecting);
      }
    }

    /**
     * Sets the first visible item as the currently viewed TOC item.
     */
    function updateViewedTocItem() {
      const visibleIds = Array.from(intersectionMap.entries())
        .filter(([, value]) => value)
        .map(([key]) => key)
        .map((target) => idMap.get(target) ?? "");

      if (visibleIds.length === 0) {
        return;
      }

      setCurrentViewedTocItem(visibleIds[0]);
    }

    const intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        manageIntersectionMap(entries);
        updateViewedTocItem();
      },
      {
        threshold: [0.0, 1.0],
      }
    );

    Array.from(targets).reduce((currentId, target) => {
      const targetId = target.id.toLowerCase();
      if (targetId && tocIds.includes(targetId)) {
        currentId = targetId;
      }
      idMap.set(target, currentId);

      intersectionMap.set(target, false);
      intersectionObserver.observe(target);

      return currentId;
    }, "");

    return () => intersectionObserver.disconnect();
  }, [toc]);

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
