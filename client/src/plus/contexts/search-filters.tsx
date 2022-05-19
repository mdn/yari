// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";

interface SearchFiltersInterface {
  selectedTerms: string;
  selectedFilter: string;
  selectedSort: string;
  setSelectedTerms: Function;
  setSelectedFilter: Function;
  setSelectedSort: Function;
  getSearchFiltersParams: () => URLSearchParams;
}

const searchFiltersContext = React.createContext<SearchFiltersInterface>({
  selectedTerms: "",
  selectedFilter: "",
  selectedSort: "",
  setSelectedTerms: () => {},
  setSelectedFilter: () => {},
  setSelectedSort: () => {},
  getSearchFiltersParams: () => new URLSearchParams(),
});

const SearchFiltersProvider = (props) => {
  const [selectedTerms, setSelectedTerms] = React.useState<string>("");
  const [selectedFilter, setSelectedFilter] = React.useState<string>("");
  const [selectedSort, setSelectedSort] = React.useState<string>("");

  const state = {
    selectedTerms,
    selectedFilter,
    selectedSort,

    setSelectedTerms,
    setSelectedFilter,
    setSelectedSort,
    getSearchFiltersParams: (): URLSearchParams => {
      const params: string[][] = [];
      if (selectedTerms) {
        params.push(["q", selectedTerms]);
      }
      if (selectedFilter) {
        params.push(selectedFilter.split("=", 2));
      }
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
