import React, { useEffect, useState } from "react";

import { Button } from "../../ui/atoms/button";
import { Search } from "../../ui/atoms/search";
import { Submenu } from "../../ui/molecules/submenu";

import "./index.scss";
import { DropdownMenu, DropdownMenuWrapper } from "../../ui/molecules/dropdown";
import { useSearchParams } from "react-router-dom";
import { camelUnwrap } from "../../utils";

export type AnyFilter = SelectFilter;

type SelectFilter = {
  type: "select";
  key: string;
  label: string;
  multiple?: {
    encode: (...values: string[]) => string;
    decode: (value: string) => string[];
  };
  options: {
    label: string;
    value: string;
    isDefault?: true;
  }[];
};

export type AnySort = { label: string; param: string; isDefault?: true };

enum Params {
  PAGE = "page",
  QUERY = "q",
}

export default function SearchFilter({
  isDisabled = false,
  filters = [],
  sorts = [],
  onChange = (key, newValue, oldValue) => {},
}: {
  isDisabled?: boolean;
  filters?: AnyFilter[];
  sorts?: AnySort[];
  onChange?: (
    key: string,
    newValue: string | null,
    oldValue: string | null
  ) => unknown;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [isSortingOpen, setIsSortingOpen] = useState<boolean>(false);
  const [terms, setTerms] = useState<string>("");

  useEffect(
    () => setTerms(searchParams.get(Params.QUERY) ?? ""),
    [searchParams]
  );

  const sortedParams = (params: URLSearchParams): URLSearchParams =>
    new URLSearchParams(
      [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
    );

  const replaceSearchParam = (key: string, value: string | null) => {
    setSearchParams((params) => {
      const oldValue = params.get(key);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      onChange(key, value, oldValue);
      params.delete(Params.PAGE);
      return sortedParams(params);
    });
  };

  const isDefaultFilter = (key: string, value: string) => {
    const filter = filters.find((filter) => filter.key === key) as AnyFilter;
    const option = filter.options.find((option) => option.value === value);
    return option?.isDefault ?? false;
  };

  const isCurrentFilter = (key: string, value: string) => {
    const currentValue = searchParams.get(key) ?? null;
    const filter = filters.find((filter) => filter.key === key) as AnyFilter;

    if (filter.multiple) {
      const values =
        typeof currentValue === "string"
          ? filter.multiple.decode(currentValue)
          : [];
      return values.includes(value);
    } else {
      return currentValue
        ? currentValue === value
        : isDefaultFilter(key, value);
    }
  };

  const isDefaultSort = (param: string) => {
    const sort = sorts.find((sort) => sort.param === param);
    return sort?.isDefault ?? false;
  };

  const isCurrentSort = (param: string) => {
    const [key, value] = param.split("=", 2);
    const currentValue = searchParams.get(key) ?? null;
    return currentValue ? currentValue === value : isDefaultSort(param);
  };

  const toggleSelectedFilter = (key: string, value: string) => {
    const currentValue = searchParams.get(key) ?? null;
    const filter = filters.find((filter) => filter.key === key) as AnyFilter;
    let newValue: string | null;

    if (filter.multiple) {
      let values =
        typeof currentValue === "string"
          ? filter.multiple.decode(currentValue)
          : [];
      if (values.includes(value)) {
        values = values.filter((v) => v !== value);
      } else {
        values = [...values, value].sort();
      }
      if (values.length) {
        newValue = filter.multiple.encode(...values);
      } else {
        newValue = null;
      }
    } else if (isDefaultFilter(key, value)) {
      newValue = null;
    } else {
      newValue = currentValue !== value ? value : null;
    }

    replaceSearchParam(key, newValue);
  };

  const toggleSelectedSort = (param: string) => {
    const [key, value] = param.split("=", 2);
    const newValue = isDefaultSort(param) ? "" : value;

    replaceSearchParam(key, newValue);
  };

  const setSelectedTerms = (newValue: string) => {
    replaceSearchParam("q", newValue);
  };

  const filterMenus = filters.map((filter) => ({
    key: filter.key,
    label: filter.label,
    id: `filters-menu-${filter.key}`,
    items: filter.options.map((option) => ({
      component: () => (
        <Button
          isDisabled={isDisabled}
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
          isDisabled={isDisabled}
          type="action"
          extraClasses={isCurrentSort(sort.param) ? "active-menu-item" : ""}
          onClickHandler={() => toggleSelectedSort(sort.param)}
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
      {filterMenus.map((filterMenu) => (
        <DropdownMenuWrapper
          key={filterMenu.key}
          className="search-filter-category search-filter-filters"
          isOpen={openFilter === filterMenu.key}
          setIsOpen={(isOpen: boolean) =>
            setOpenFilter(isOpen ? filterMenu.key : null)
          }
        >
          <Button
            type="select"
            aria-controls={filterMenu.id}
            aria-haspopup={"menu"}
            aria-expanded={openFilter === filterMenu.key}
            extraClasses={`${
              searchParams.get(filterMenu.key) ? "active" : ""
            } ${isDisabled ? "inactive" : ""}`}
            onClickHandler={() =>
              setOpenFilter(
                openFilter === filterMenu.key ? null : filterMenu.key
              )
            }
            isDisabled={filterMenu.items.length === 0}
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

      <Search
        isDisabled={isDisabled}
        name="terms"
        placeholder="Filter by keyword"
        value={terms}
        onBlurHandler={() =>
          // The updates event list uses `camelWrap()` to insert
          // zero-width spaces, so we `camelUnwrap()` them here.
          // Otherwise we would not find a copy-pasted feature.
          setSelectedTerms(camelUnwrap(terms))
        }
        onChangeHandler={(e) => setTerms(e.target.value)}
        onResetHandler={() => {
          setTerms("");
          setSelectedTerms("");
        }}
      />

      {sorts.length ? (
        <DropdownMenuWrapper
          className="search-filter-category search-filter-sorts"
          isOpen={isSortingOpen}
          setIsOpen={setIsSortingOpen}
        >
          <Button
            type="select"
            aria-controls={sortMenu.id}
            aria-haspopup={"menu"}
            aria-expanded={isSortingOpen || undefined}
            extraClasses={`${searchParams.get("sort") ? "active" : ""} ${
              isDisabled ? "inactive" : ""
            }`}
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
