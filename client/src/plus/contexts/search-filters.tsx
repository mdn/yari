import React, { useEffect } from "react";

interface SearchFiltersInterface {
  selectedTerms: string;
  selectedFilters: Record<string, string>;
  selectedSort: string;
  searchParams: string;
  setSelectedTerms: (terms: string) => void;
  setSelectedFilters: (filters: Record<string, string>) => void;
  setSelectedSort: (sort: string) => void;
  clearSearchFilters: () => void;
}

const searchFiltersContext = React.createContext<SearchFiltersInterface>({
  selectedTerms: "",
  selectedFilters: {},
  selectedSort: "",
  searchParams: "",
  setSelectedTerms: () => {},
  setSelectedFilters: () => {},
  setSelectedSort: () => {},
  clearSearchFilters: () => {},
});

const SearchFiltersProvider = (props) => {
  const defaultFilters = Object.freeze({});
  const [selectedTerms, setSelectedTerms] = React.useState<string>("");
  const [selectedFilters, setSelectedFilters] =
    React.useState<Record<string, string>>(defaultFilters);
  const [selectedSort, setSelectedSort] = React.useState<string>("");
  const [searchParams, setSearchParams] = React.useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTerms) {
      params.set("q", selectedTerms);
    }
    Object.entries(selectedFilters).forEach(([key, value]) =>
      params.set(key, value)
    );
    if (selectedSort) {
      const [key, value] = selectedSort.split("=", 2);
      params.set(key, value);
    }
    setSearchParams(params.toString());
  }, [selectedTerms, selectedFilters, selectedSort]);

  const state = {
    selectedTerms,
    selectedFilters,
    selectedSort,
    searchParams,
    setSelectedTerms,
    setSelectedFilters,
    setSelectedSort,
    clearSearchFilters: () => {
      selectedTerms && setSelectedTerms("");
      selectedSort && setSelectedSort("");
      Object.keys(selectedFilters).length && setSelectedFilters({});
    },
  };

  return (
    <searchFiltersContext.Provider value={state}>
      {props.children}
    </searchFiltersContext.Provider>
  );
};

export { searchFiltersContext, SearchFiltersProvider };
