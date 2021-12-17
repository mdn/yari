import React, { useContext } from "react";

import { searchFiltersContext } from "../contexts/search-filters";

import { Button } from "../../ui/atoms/button";
import { Submenu } from "../../ui/molecules/submenu";

import "./index.scss";

export default function SearchFilter({ filters, sorts }) {
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  const [selectedFilter, setSelectedFilter] = useContext(searchFiltersContext);
  const [selectedSort, setSelectedSort] = useContext(searchFiltersContext);

  const filterMenu = {
    label: "Filters",
    id: "filters-menu",
    items: filters.map((filter) => ({
      component: () => (
        <Button
          type="action"
          extraClasses={
            selectedFilter === filter.param ? "active-menu-item" : undefined
          }
          onClickHandler={() => {
            setSelectedFilter(filter.path);
          }}
        >
          {filter.label}
        </Button>
      ),
    })),
  };

  const sortMenu = {
    label: "Sort",
    id: "sort-menu",
    items: sorts.map((sort) => ({
      component: () => (
        <Button
          type="action"
          extraClasses={
            selectedSort === sort.param ? "active-menu-item" : undefined
          }
          onClickHandler={() => {
            setSelectedSort(sort.path);
          }}
        >
          {sort.label}
        </Button>
      ),
    })),
  };

  /**
   * Show and hide submenu
   * @param {String} menuEntryId - The current top-level menu item id
   */
  function toggleSubMenu(menuEntryId) {
    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;
    setVisibleSubMenuId(visibleSubMenuId === menuEntryId ? null : menuEntryId);
  }

  function hideSubMenuIfVisible() {
    if (visibleSubMenuId) {
      setVisibleSubMenuId(null);
    }
  }

  React.useEffect(() => {
    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") {
        hideSubMenuIfVisible();
      }
    });
  });

  return (
    <form className="search-filter">
      <input type="search" />

      <div className="search-filter-filters">
        <Button
          type="action"
          ariaControls={filterMenu.id}
          ariaHasPopup={"menu"}
          ariaExpanded={filterMenu.id === visibleSubMenuId}
          onClickHandler={() => {
            toggleSubMenu(filterMenu.id);
          }}
        >
          {filterMenu.label}
        </Button>
        <Submenu
          menuEntry={filterMenu}
          visibleSubMenuId={visibleSubMenuId}
          onBlurHandler={hideSubMenuIfVisible}
        />
      </div>

      <div className="search-filter-sorts">
        <Button
          type="action"
          ariaControls={sortMenu.id}
          ariaHasPopup={"menu"}
          ariaExpanded={sortMenu.id === visibleSubMenuId}
          onClickHandler={() => {
            toggleSubMenu(sortMenu.id);
          }}
        >
          {sortMenu.label}
        </Button>
        <Submenu
          menuEntry={sortMenu}
          visibleSubMenuId={visibleSubMenuId}
          onBlurHandler={hideSubMenuIfVisible}
        />
      </div>
    </form>
  );
}
