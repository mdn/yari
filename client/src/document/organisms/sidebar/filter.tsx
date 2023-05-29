import { useEffect, useState } from "react";
import { SidebarFilterer } from "./SidebarFilterer";

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
      <input
        type="text"
        placeholder="Filter sidebar"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </section>
  );
}
