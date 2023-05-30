import { useEffect, useState } from "react";
import { SidebarFilterer } from "./SidebarFilterer";
import { Button } from "../../../ui/atoms/button";

import "./filter.scss";

export function SidebarFilter() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const quicklinks = document.getElementById("sidebar-quicklinks");

    if (!quicklinks) {
      return;
    }

    const filterer = new SidebarFilterer(quicklinks);
    filterer.applyFilter(query);
  }, [query]);

  return (
    <section className="sidebar-filter">
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
    </section>
  );
}
