import React from "react";

interface SearchFiltersInterface {
  selectedTerms: string;
  selectedFilter: string;
  selectedFilters: Record<string, string>;
  selectedSort: string;
  setSelectedTerms: (terms: string) => void;
  setSelectedFilter: (filter: string) => void;
  setSelectedFilters: (filters: Record<string, string>) => void;
  setSelectedSort: (sort: string) => void;
  clearSearchFilters: () => void;
  getSearchFiltersParams: () => URLSearchParams;
}

const searchFiltersContext = React.createContext<SearchFiltersInterface>({
  selectedTerms: "",
  selectedFilter: "",
  selectedFilters: {},
  selectedSort: "",
  setSelectedTerms: () => {},
  setSelectedFilter: () => {},
  setSelectedFilters: () => {},
  setSelectedSort: () => {},
  clearSearchFilters: () => {},
  getSearchFiltersParams: () => new URLSearchParams(),
});

const SearchFiltersProvider = (props) => {
  const [selectedTerms, setSelectedTerms] = React.useState<string>("");
  const [selectedFilter, setSelectedFilter] = React.useState<string>("");
  const [selectedFilters, setSelectedFilters] = React.useState<
    Record<string, string>
  >({});
  const [selectedSort, setSelectedSort] = React.useState<string>("");

  const state = {
    selectedTerms,
    selectedFilter,
    selectedFilters,
    selectedSort,

    setSelectedTerms,
    setSelectedFilter,
    setSelectedFilters,
    setSelectedSort,
    clearSearchFilters: () => {
      setSelectedTerms("");
      setSelectedSort("");
      setSelectedFilter("");
    },
    getSearchFiltersParams: (): URLSearchParams => {
      const params: string[][] = [];
      if (selectedTerms) {
        params.push(["q", selectedTerms]);
      }
      if (selectedFilter) {
        params.push(selectedFilter.split("=", 2));
      }
      params.push(...Object.entries(selectedFilters));
      if (selectedSort) {
        params.push(selectedSort.split("=", 2));
      }
      return new URLSearchParams(params);
    },
  };

  return (
    <searchFiltersContext.Provider value={state}>
      {props.children}
    </searchFiltersContext.Provider>
  );
};

export { searchFiltersContext, SearchFiltersProvider };
