import React, { useState } from "react";

import "./index.scss";
import { Toc } from "../../types";
import { useFirstVisibleElement } from "../../hooks";

export function TOC({ toc }: { toc: Toc[] }) {
  const [currentViewedTocItem, setCurrentViewedTocItem] = useState("");

  const observedElements = React.useCallback(() => {
    const mainElement = document.querySelector("main") ?? document;
    const elements = mainElement.querySelectorAll(
      "h1, h1 ~ *, h2, h2 ~ *, h3, h3 ~ *"
    );
    return Array.from(elements);
  }, []);

  const referencedIds = toc.map(({ id }) => id);
  const idByObservedElement = React.useRef(new Map<Element, string>());

  React.useEffect(() => {
    observedElements().reduce((currentId, observedElement) => {
      const observedId = observedElement.id.toLowerCase();
      if (observedId && referencedIds.includes(observedId)) {
        currentId = observedId;
      }
      idByObservedElement.current.set(observedElement, currentId);

      return currentId;
    }, "");
  }, [observedElements, referencedIds]);

  useFirstVisibleElement(observedElements, (element: Element | null) => {
    const id = element ? idByObservedElement.current.get(element) ?? "" : "";
    if (id !== currentViewedTocItem) {
      setCurrentViewedTocItem(id);
    }
  });

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
