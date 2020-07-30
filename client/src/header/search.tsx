import * as React from "react";
import { useEffect, useRef, useState } from "react";

// import { useLocale } from "../hooks";
import { SearchNavigateWidget } from "../search";
import CloseIcon from "../kumastyles/general/close.svg";
import SearchIcon from "../kumastyles/general/search.svg";

export default function Search() {
  // const locale = useLocale();
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");

  // After our first render, set the input field's initial value
  // and show search form
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current && query) {
      inputRef.current.value = query;
      setShowForm(true);
    }
  }, [query, showForm]);

  const handleClick = (event) => {
    event.preventDefault();

    if (showForm) {
      setShowForm(false);
      setQuery("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } else {
      setShowForm(true);
      inputRef.current && inputRef.current.focus();
    }
  };

  return (
    <div className={`header-search ${showForm ? "show-form" : ""}`}>
      <SearchNavigateWidget />
      {/* <form
        id="nav-main-search"
        action={`/${locale}/search`}
        method="get"
        role="search"
      >
        <img src={SearchIcon} alt="search" className="search-icon" />

        <label htmlFor="main-q" className="visually-hidden">
          Search MDN
        </label>
        <input
          className="search-input-field"
          ref={inputRef}
          type="search"
          id="main-q"
          name="q"
          placeholder="Search MDN"
          pattern="(.|\s)*\S(.|\s)*"
          required
        />
      </form> */}
      <button className="toggle-form" onClick={handleClick}>
        {/* In order for transitions to work correctly we need
            the `CloseIcon` icon to be in the DOM prior to transitioning.
           Transitions can also not be done between `display: none` and
           `display: block` so, we use the `.hide` class which uses
           `visibility:hidden`
          */}
        <img
          src={CloseIcon}
          alt="close"
          className={showForm ? "close-icon" : "close-icon hide"}
        />

        {/* The `SearchIcon` is not animated and so we can add/remove
            the SVG dynamically based on the `showForm` state */}
        {!showForm && (
          <img src={SearchIcon} alt="search" className="search-icon" />
        )}

        <span>{showForm ? "Close search" : "Open search"}</span>
      </button>
    </div>
  );
}
