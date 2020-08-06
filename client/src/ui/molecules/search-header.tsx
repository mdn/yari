import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { SearchNavigateWidget } from "../../search";

import "./search-header.scss";

export default function Search() {
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
      {showForm ? (
        <button className="ghost close-search" onClick={handleClick}>
          <span className="visually-hidden">Close search</span>
        </button>
      ) : (
        <button className="ghost open-search" onClick={handleClick}>
          <span className="visually-hidden">Open search</span>
        </button>
      )}
    </div>
  );
}
