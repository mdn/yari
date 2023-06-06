import { MutableRefObject, useEffect, useRef, useState } from "react";
import { SidebarFilterer } from "./SidebarFilterer";
import { Button } from "../../../ui/atoms/button";
import { GleanThumbs } from "../../../ui/atoms/thumbs";

import "./filter.scss";
import { useGleanClick } from "../../../telemetry/glean-context";
import { SIDEBAR_FILTER_FOCUS } from "../../../telemetry/constants";

export function SidebarFilter() {
  const [query, setQuery] = useState("");
  const [matchCount, setMatchCount] = useState<Number | undefined>(undefined);
  const [hasUserInteraction, setUserInteraction] = useState<Boolean>(false);
  const filtererRef = useRef<SidebarFilterer | null>(null);
  const quicklinksRef = useRef<HTMLElement | null>(null);
  const { saveScrollPosition, restoreScrollPosition } =
    usePersistedScrollPosition(quicklinksRef);
  const gleanClick = useGleanClick();

  useEffect(() => {
    quicklinksRef.current = document.getElementById("sidebar-quicklinks");
  });

  useEffect(() => {
    const quicklinks = quicklinksRef.current;
    if (!quicklinks) {
      return;
    }

    // Filter sidebar.
    let filterer = filtererRef.current;
    if (!filterer) {
      const root = quicklinks.querySelector<HTMLElement>(".sidebar-body");

      if (!root) {
        return;
      }

      filterer = new SidebarFilterer(root);
      filtererRef.current = filterer;
    }

    // Save scroll position.
    if (query) {
      saveScrollPosition();
    }

    const items = filterer.applyFilter(query);
    setMatchCount(items);

    // Restore scroll position.
    if (!query) {
      restoreScrollPosition();
    }
  }, [query, saveScrollPosition, restoreScrollPosition]);

  useEffect(() => {
    if (hasUserInteraction) {
      gleanClick(SIDEBAR_FILTER_FOCUS);
    }
  }, [gleanClick, hasUserInteraction]);

  return (
    <section className="sidebar-filter-container">
      <div className="sidebar-filter">
        <label
          id="sidebar-filter-label"
          className="sidebar-filter-label"
          htmlFor="sidebar-filter-input"
        >
          <span className="icon icon-filter"></span>
          <span className="visually-hidden">Filter sidebar</span>
        </label>
        <input
          id="sidebar-filter-input"
          className={`sidebar-filter-input-field ${
            hasUserInteraction && "has-user-interaction"
          }`}
          type="text"
          placeholder="Filter"
          value={query}
          onFocus={() => setUserInteraction(true)}
          onChange={(event) => setQuery(event.target.value)}
        />
        {matchCount !== undefined && (
          <span className="sidebar-filter-count">
            {matchCount === 0
              ? "No matches"
              : `${matchCount} ${matchCount === 1 ? "match" : "matches"}`}
          </span>
        )}
        <Button
          type="action"
          icon="cancel"
          extraClasses="clear-sidebar-filter-button"
          onClickHandler={() => {
            setQuery("");
            setUserInteraction(false);
          }}
        >
          <span className="visually-hidden">Clear filter input</span>
        </Button>
      </div>
      {hasUserInteraction && (
        <div className="sidebar-filter-footer">
          <div className="sidebar-filter-thumbs">
            <GleanThumbs feature="sidebar-filter" />
          </div>
        </div>
      )}
    </section>
  );
}

function usePersistedScrollPosition(ref: MutableRefObject<HTMLElement | null>) {
  const scrollTopRef = useRef<Number | undefined>(undefined);

  const el = ref.current;

  return {
    saveScrollPosition() {
      if (
        el &&
        typeof scrollTopRef.current === "undefined" &&
        el.scrollTop > 0
      ) {
        scrollTopRef.current = el.scrollTop;
        el.scrollTop = 0;
      }
    },
    restoreScrollPosition() {
      if (el && typeof scrollTopRef.current === "number") {
        el.scrollTop = scrollTopRef.current;
        scrollTopRef.current = undefined;
      }
    },
  };
}
