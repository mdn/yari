import React, { useContext } from "react";

import { Button } from "../../ui/atoms/button";
import { Search } from "../../ui/atoms/search";
import { Submenu } from "../../ui/molecules/submenu";
import { searchFiltersContext } from "../contexts/search-filters";
import { useDebouncedCallback } from "use-debounce";

import "./index.scss";

export default function SearchFilter({
  filters = [],
  sorts = [],
}: {
  filters?: { label: string; param: string }[];
  sorts?: { label: string; param: string }[];
}) {
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  const {
    selectedFilter,
    selectedSort,
    setSelectedTerms,
    setSelectedFilter,
    setSelectedSort,
  } = useContext(searchFiltersContext);

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
            setSelectedFilter(filter.param);
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
            setSelectedSort(sort.param);
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
      <Search
        name="terms"
        placeholder="Filter by keyword"
        onChangeHandler={useDebouncedCallback((e) => {
          setSelectedTerms(e.target.value);
        }, 400)}
      />

      {filters.length ? (
        <div className="search-filter-category search-filter-filters">
          <Button
            type="select"
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
      ) : null}

      {sorts.length ? (
        <div className="search-filter-category search-filter-sorts">
          <Button
            type="select"
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
      ) : null}
    </form>
  );
}
