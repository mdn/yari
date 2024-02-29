import React, { useState } from "react";

import "./index.scss";
import { Toc } from "../../../../../libs/types/document";
import { useFirstVisibleElement } from "../../hooks";
import { useGleanClick } from "../../../telemetry/glean-context";
import { TOC_CLICK } from "../../../telemetry/constants";

export function TOC({ toc, title }: { toc: Toc[]; title?: string }) {
  const [currentViewedTocItem, setCurrentViewedTocItem] = useState("");

  const observedElements = React.useCallback(() => {
    const mainElement = document.querySelector("main") ?? document;
    const elements = mainElement.querySelectorAll(
      "h1, h1 ~ *:not(section), h2:not(.document-toc-heading), h2:not(.document-toc-heading) ~ *:not(section), h3, h3 ~ *:not(section)"
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
    <>
      <div className="document-toc-container">
        <section className="document-toc">
          <header>
            <h2 className="document-toc-heading">
              {title || "In this article"}
            </h2>
          </header>
          <ul className="document-toc-list">
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
      </div>
    </>
  );
}

function TOCItem({
  id,
  text,
  sub,
  currentViewedTocItem,
}: Toc & { currentViewedTocItem: string }) {
  const gleanClick = useGleanClick();
  const href = id && `#${id.toLowerCase()}`;
  return (
    <li className={`document-toc-item ${sub ? "document-toc-item-sub" : ""}`}>
      <a
        className="document-toc-link"
        key={id}
        aria-current={currentViewedTocItem === id?.toLowerCase() || undefined}
        href={href}
        dangerouslySetInnerHTML={{ __html: text }}
        onClick={() => gleanClick(`${TOC_CLICK}: ${href}`)}
      />
    </li>
  );
}
