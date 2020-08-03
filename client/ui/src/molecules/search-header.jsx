import * as React from "react";
import { useEffect, useRef } from "react";

import { getLocale, gettext } from "../utils/l10n.js";
import SearchIcon from "../../dinocons/general/search.svg";

import "./search-header.scss";

type Props = {
  initialQuery: string,
};

export default function SearchHeader({ initialQuery }: Props) {
  const locale = getLocale();
  const [showForm, setShowForm] = React.useState(false);
  const [query, setQuery] = React.useState(initialQuery);

  // After our first render, set the input field's initial value
  // and show search form
  const inputfield = useRef(null);
  useEffect(() => {
    if (inputfield.current && query) {
      inputfield.current.value = query;
      setShowForm(true);
    }
  }, [query, showForm]);

  const handleClick = (event) => {
    event.preventDefault();

    if (showForm === true) {
      setQuery(null);
      if (inputfield.current) {
        inputfield.current.value = "";
      }
    } else {
      inputfield.current && inputfield.current.focus();
    }
  };

  return (
    <div className={`header-search ${showForm ? "show-form" : ""}`}>
      <form
        id="nav-main-search"
        action={`/${locale}/search`}
        method="get"
        role="search"
      >
        <SearchIcon className="search-icon" />

        <label htmlFor="main-q" className="visually-hidden">
          {gettext("Search MDN")}
        </label>
        <input
          className="search-input-field"
          ref={inputfield}
          type="search"
          id="main-q"
          name="q"
          placeholder={gettext("Search MDN")}
          pattern="(.|\s)*\S(.|\s)*"
          required
        />
      </form>
      {showForm ? (
        <button
          className="ghost close-search"
          onClick={(event) => {
            setShowForm(false);
            handleClick(event);
          }}
        >
          <span className="visually-hidden">{gettext("Close search")}</span>
        </button>
      ) : (
        <button
          className="ghost open-search"
          onClick={(event) => {
            setShowForm(true);
            handleClick(event);
          }}
        >
          <span className="visually-hidden">{gettext("Open search")}</span>
        </button>
      )}
    </div>
  );
}
