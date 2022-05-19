// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React, { useContext, useState } from "react";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/atoms/button'. Did yo... Remove this comment to see the full error message
import { Button } from "../../ui/atoms/button";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/atoms/search'. Did yo... Remove this comment to see the full error message
import { Search } from "../../ui/atoms/search";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/submenu'. D... Remove this comment to see the full error message
import { Submenu } from "../../ui/molecules/submenu";
import { searchFiltersContext } from "../contexts/search-filters";

import "./index.scss";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/dropdown'. ... Remove this comment to see the full error message
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";

export default function SearchFilter({
  filters = [],
  sorts = [],
}: {
  filters?: { label: string; param: string }[];
  sorts?: { label: string; param: string }[];
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isSortingOpen, setIsSortingOpen] = useState<boolean>(false);
  const [terms, setTerms] = useState<string>("");

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
            selectedFilter === filter.param ? "active-menu-item" : ""
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
          extraClasses={selectedSort === sort.param ? "active-menu-item" : ""}
          onClickHandler={() => {
            setSelectedSort(sort.param);
          }}
        >
          {sort.label}
        </Button>
      ),
    })),
  };

  return (
    <form
      className={`search-filter ${
        !filters.length ? "inline-on-mobile" : undefined
      }`}
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        setSelectedTerms(terms);
      }}
    >
      <Search
        name="terms"
        placeholder="Filter by keyword"
        onBlurHandler={() => setSelectedTerms(terms)}
        onChangeHandler={(e) => setTerms(e.target.value)}
      />

      {filters.length ? (
        <DropdownMenuWrapper
          className="search-filter-category search-filter-filters"
          isOpen={isFiltersOpen}
          setIsOpen={setIsFiltersOpen}
        >
          <Button
            type="select"
            ariaControls={filterMenu.id}
            ariaHasPopup={"menu"}
            ariaExpanded={isFiltersOpen || undefined}
            onClickHandler={() => {
              setIsFiltersOpen(!isFiltersOpen);
            }}
          >
            {filterMenu.label}
          </Button>
          <DropdownMenu>
            <Submenu
              submenuId={filterMenu.id}
              menuEntry={filterMenu}
              isDropdown
            />
          </DropdownMenu>
        </DropdownMenuWrapper>
      ) : null}

      {sorts.length ? (
        <DropdownMenuWrapper
          className="search-filter-category search-filter-sorts"
          isOpen={isSortingOpen}
          setIsOpen={setIsSortingOpen}
        >
          <Button
            type="select"
            ariaControls={sortMenu.id}
            ariaHasPopup={"menu"}
            ariaExpanded={isSortingOpen || undefined}
            onClickHandler={() => {
              setIsSortingOpen(!isSortingOpen);
            }}
          >
            {sortMenu.label}
          </Button>
          <DropdownMenu>
            <Submenu submenuId={sortMenu.id} menuEntry={sortMenu} isDropdown />
          </DropdownMenu>
        </DropdownMenuWrapper>
      ) : null}
    </form>
  );
}
