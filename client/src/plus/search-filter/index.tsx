import React, { useContext, useState } from "react";

import { Button } from "../../ui/atoms/button";
import { Search } from "../../ui/atoms/search";
import { Submenu } from "../../ui/molecules/submenu";
import { searchFiltersContext } from "../contexts/search-filters";

import "./index.scss";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";

export type AnyFilter = SelectFilter;

type SelectFilter = {
  type: "select";
  key: string;
  label: string;
  options: {
    label: string;
    value: string;
  }[];
};

export default function SearchFilter({
  filters = [],
  sorts = [],
}: {
  filters?: AnyFilter[];
  sorts?: { label: string; param: string }[];
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isSortingOpen, setIsSortingOpen] = useState<boolean>(false);
  const [terms, setTerms] = useState<string>("");

  const {
    selectedFilters,
    selectedSort,
    setSelectedTerms,
    setSelectedFilters,
    setSelectedSort,
  } = useContext(searchFiltersContext);

  const isCurrentFilter = (key: string, value: string) =>
    (selectedFilters[key] ?? null) === value;

  const toggleSelectedFilter = (key: string, value: string) => {
    const isCurrent = (selectedFilters[key] ?? null) === value;
    const newFilters = {
      ...selectedFilters,
    };
    if (isCurrent) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setSelectedFilters(newFilters);
  };

  const filterMenus = filters.map((filter) => ({
    key: filter.key,
    label: filter.label,
    id: "filters-menu",
    items: filter.options.map((option) => ({
      component: () => (
        <Button
          type="action"
          extraClasses={
            isCurrentFilter(filter.key, option.value) ? "active-menu-item" : ""
          }
          onClickHandler={() => {
            toggleSelectedFilter(filter.key, option.value);
          }}
        >
          {option.label}
        </Button>
      ),
    })),
  }));

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

      {filterMenus.map((filterMenu) => (
        <DropdownMenuWrapper
          key={filterMenu.key}
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
      ))}

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
