import React from "react";

interface SearchFiltersInterface {
  selectedTerms: string;
  selectedFilter: string;
  selectedSort: string;
  setSelectedTerms: (terms: string) => void;
  setSelectedFilter: (filter: string) => void;
  setSelectedSort: (sort: string) => void;
}

const searchFiltersContext = React.createContext<SearchFiltersInterface>({
  selectedTerms: "",
  selectedFilter: "",
  selectedSort: "",
  setSelectedTerms: () => {},
  setSelectedFilter: () => {},
  setSelectedSort: () => {},
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
  };

  return (
    <searchFiltersContext.Provider value={state}>
      {props.children}
    </searchFiltersContext.Provider>
  );
};

export { searchFiltersContext, SearchFiltersProvider };
