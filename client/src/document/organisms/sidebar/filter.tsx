import { useEffect, useState } from "react";

export function SidebarFilter() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const links = document.querySelectorAll("#sidebar-quicklinks a[href]");
    if (query) {
      // Hide all except matches.
    } else {
      // Show all.
    }
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
