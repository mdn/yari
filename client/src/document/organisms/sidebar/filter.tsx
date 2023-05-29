import { useEffect, useState } from "react";

export function SidebarFilter() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const quicklinks = document.getElementById("sidebar-quicklinks");
    if (!quicklinks) {
      return;
    }

    const details = Array.from(
      quicklinks.querySelectorAll<HTMLDetailsElement>("details")
    );
    const links = Array.from(
      quicklinks.querySelectorAll<HTMLAnchorElement>("a[href]")
    );

    if (query) {
      // Hide and collapse all parents.
      details.forEach((detail) => {
        detail.style.display = "none";
        detail.dataset.open = detail.dataset.open ?? String(detail.open);
        detail.open = false;
      });

      // Show/hide items (+ show parents).
      const queryLC = query.toLowerCase();
      links.forEach((link) => {
        const isMatch = link.innerText.toLowerCase().includes(queryLC);
        const target = link.closest("li") || link;

        if (isMatch) {
          // Show item.
          target.style.display = "inherit";

          // Expand parents.
          let parent = target.parentElement;
          while (parent) {
            if (parent instanceof HTMLDetailsElement) {
              parent.style.display = "inherit";
              parent.open = true;
            }
            parent = parent.parentElement;
          }
        } else {
          // Hide item.
          target.style.display = "none";
        }
      });
    } else {
      // Show all links.
      links.forEach((link) => {
        const target = link.closest("li") || link;
        target.style.display = "inherit";
      });

      // Show all parents.
      details.forEach((detail) => {
        detail.style.display = "inherit";
        if (detail.dataset.open) {
          detail.open = JSON.parse(detail.dataset.open);
          delete detail.dataset.open;
        }
      });
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
