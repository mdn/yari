import React from "react";

type SearchFiltersData = {
  selectedTerms?: string;
  selectedFilters?: string;
  selectedSort?: string;
};

const searchFiltersContext = React.createContext<SearchFiltersData>({
  selectedTerms: "",
  selectedFilters: "",
  selectedSort: "",
});

const SearchFiltersProvider = (props) => {
  const [selectedTerms, setSelectedTerms] = React.useState<string>("");
  const [selectedFilters, setSelectedFilters] = React.useState<string>("");
  const [selectedSort, setSelectedSort] = React.useState<string>("");

  const state = {
    selectedTerms,
    selectedFilters,
    selectedSort,

    setSelectedTerms,
    setSelectedFilters,
    setSelectedSort,
  };

  return (
    <searchFiltersContext.Provider value={state}>
      {props.children}
    </searchFiltersContext.Provider>
  );
};

export { searchFiltersContext, SearchFiltersProvider };
