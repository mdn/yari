import { useEffect, useState } from "react";
import { SidebarFilterer } from "./SidebarFilterer";
import { Button } from "../../../ui/atoms/button";
import { GleanThumbs } from "../../../ui/atoms/thumbs";

import "./filter.scss";
import { useGleanClick } from "../../../telemetry/glean-context";
import { SIDEBAR_FILTER_FOCUS } from "../../../telemetry/constants";

export function SidebarFilter() {
  const [query, setQuery] = useState("");
  const [scrollTop, setScrollTop] = useState<Number | undefined>(undefined);
  const [matchCount, setMatchCount] = useState<Number | undefined>(undefined);
  const [hasUserInteraction, setUserInteraction] = useState<Boolean>(false);
  const gleanClick = useGleanClick();

  useEffect(() => {
    const quicklinks = document.getElementById("sidebar-quicklinks");

    if (!quicklinks) {
      return;
    }

    const root = quicklinks.querySelector<HTMLElement>(".sidebar-body");

    if (!root) {
      return;
    }

    // Save scroll position.
    if (query && typeof scrollTop === "undefined" && quicklinks.scrollTop > 0) {
      setScrollTop(quicklinks.scrollTop);
      quicklinks.scrollTop = 0;
    }

    // Filter sidebar.
    const filterer = new SidebarFilterer(root);
    const items = filterer.applyFilter(query);
    setMatchCount(items);

    // Restore scroll position.
    if (!query && typeof scrollTop === "number") {
      quicklinks.scrollTop = scrollTop;
      setScrollTop(undefined);
    }
  }, [query, scrollTop]);

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
