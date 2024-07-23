import React, { useState } from "react";

import "./index.scss";
import { Toc } from "../../../../../libs/types/document";
import { useFirstVisibleElement } from "../../hooks";
import { useGleanClick } from "../../../telemetry/glean-context";
import { TOC_CLICK } from "../../../telemetry/constants";
import { useLocale } from "../../../hooks";
import { DEFAULT_LOCALE } from "../../../../../libs/constants";

const DEFAULT_TITLE = {
  "en-US": "In this article",
  es: "En este artículo",
  fr: "Dans cet article",
  ja: "この記事では",
  ko: "목차",
  "pt-BR": "Neste artigo",
  ru: "В этой статье",
  "zh-CN": "在本文中",
  "zh-TW": "在本文中",
};

export function TOC({ toc, title }: { toc: Toc[]; title?: string }) {
  const locale = useLocale();
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
    const id = element ? (idByObservedElement.current.get(element) ?? "") : "";
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
              {title || DEFAULT_TITLE[locale] || DEFAULT_TITLE[DEFAULT_LOCALE]}
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
