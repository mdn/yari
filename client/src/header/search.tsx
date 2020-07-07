import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { useLocale } from "./hooks";
import { ReactComponent as CloseIcon } from "../kumastyles/general/close.svg";
import { ReactComponent as SearchIcon } from "../kumastyles/general/search.svg";

export default function Search() {
  const locale = useLocale();
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");

  // After our first render, set the input field's initial value
  // and show search form
  const inpuRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inpuRef.current && query) {
      inpuRef.current.value = query;
      setShowForm(true);
    }
  }, [query, showForm]);

  const handleClick = (event) => {
    event.preventDefault();

    if (showForm) {
      setShowForm(false);
      setQuery("");
      if (inpuRef.current) {
        inpuRef.current.value = "";
      }
    } else {
      setShowForm(true);
      inpuRef.current && inpuRef.current.focus();
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
          Search MDN
        </label>
        <input
          className="search-input-field"
          ref={inpuRef}
          type="search"
          id="main-q"
          name="q"
          placeholder="Search MDN"
          pattern="(.|\s)*\S(.|\s)*"
          required
        />
      </form>
      <button className="toggle-form" onClick={handleClick}>
        {/* In order for transitions to work correctly we need
            the `CloseIcon` icon to be in the DOM prior to transitioning.
           Transitions can also not be done between `display: none` and
           `display: block` so, we use the `.hide` class which uses
           `visibility:hidden`
          */}
        <CloseIcon className={showForm ? "close-icon" : "close-icon hide"} />

        {/* The `SearchIcon` is not animated and so we can add/remove
            the SVG dynamically based on the `showForm` state */}
        {!showForm && <SearchIcon className="search-icon" />}

        <span>{showForm ? "Close search" : "Open search"}</span>
      </button>
    </div>
  );
}
