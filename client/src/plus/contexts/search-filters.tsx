import React from "react";

interface SearchFiltersInterface {
  selectedTerms: string;
  selectedFilters: Record<string, string>;
  selectedSort: string;
  setSelectedTerms: (terms: string) => void;
  setSelectedFilters: (filters: Record<string, string>) => void;
  setSelectedSort: (sort: string) => void;
  clearSearchFilters: () => void;
  getSearchFiltersParams: () => URLSearchParams;
}

const searchFiltersContext = React.createContext<SearchFiltersInterface>({
  selectedTerms: "",
  selectedFilters: {},
  selectedSort: "",
  setSelectedTerms: () => {},
  setSelectedFilters: () => {},
  setSelectedSort: () => {},
  clearSearchFilters: () => {},
  getSearchFiltersParams: () => new URLSearchParams(),
});

const SearchFiltersProvider = (props) => {
  const [selectedTerms, setSelectedTerms] = React.useState<string>("");
  const [selectedFilters, setSelectedFilters] = React.useState<
    Record<string, string>
  >({});
  const [selectedSort, setSelectedSort] = React.useState<string>("");

  const state = {
    selectedTerms,
    selectedFilters,
    selectedSort,

    setSelectedTerms,
    setSelectedFilters,
    setSelectedSort,
    clearSearchFilters: () => {
      setSelectedTerms("");
      setSelectedSort("");
      setSelectedFilters({});
    },
    getSearchFiltersParams: (): URLSearchParams => {
      const params: string[][] = [];
      if (selectedTerms) {
        params.push(["q", selectedTerms]);
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
