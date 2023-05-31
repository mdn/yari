import { useEffect, useState } from "react";
import { SidebarFilterer } from "./SidebarFilterer";
import { Button } from "../../../ui/atoms/button";
import { GleanThumbs } from "../../../ui/atoms/thumbs";

import "./filter.scss";

export function SidebarFilter() {
  const [query, setQuery] = useState("");
  const [scrollTop, setScrollTop] = useState<Number | undefined>(undefined);
  const [matchCount, setMatchCount] = useState<Number | undefined>(undefined);

  useEffect(() => {
    const quicklinks = document.getElementById("sidebar-quicklinks");

    if (!quicklinks) {
      return;
    }

    // Save scroll position.
    if (query && typeof scrollTop === "undefined" && quicklinks.scrollTop > 0) {
      setScrollTop(quicklinks.scrollTop);
      quicklinks.scrollTop = 0;
    }

    // Filter sidebar.
    const filterer = new SidebarFilterer(quicklinks);
    const items = filterer.applyFilter(query);
    setMatchCount(items);

    // Restore scroll position.
    if (!query && typeof scrollTop === "number") {
      quicklinks.scrollTop = scrollTop;
      setScrollTop(undefined);
    }
  }, [query, scrollTop]);

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
          className="sidebar-filter-input-field"
          type="text"
          placeholder="Filter sidebar"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button
          type="action"
          icon="cancel"
          extraClasses="clear-sidebar-filter-button"
          onClickHandler={() => setQuery("")}
        >
          <span className="visually-hidden">Clear filter input</span>
        </Button>
      </div>
      <div className="sidebar-filter-footer">
        {matchCount === undefined ? (
          <GleanThumbs feature="sidebar-filter" />
        ) : (
          <span>
            {matchCount === 0
              ? "No items found."
              : `${matchCount} ${matchCount === 1 ? "item" : "items"} found.`}
          </span>
        )}
      </div>
    </section>
  );
}
