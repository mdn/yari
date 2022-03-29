import * as React from "react";

import "./index.scss";

type SearchProps = {
  name: string;
  placeholder?: string;
  value?: string;
  onBlurHandler?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChangeHandler?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClickHandler?: (event: React.MouseEvent<Element>) => void;
  onFocusHandler?: (event: React.FocusEvent<Element>) => void;
};

export const Search = ({
  name,
  onBlurHandler,
  onChangeHandler,
  onClickHandler,
  onFocusHandler,
  placeholder,
  value,
}: SearchProps) => {
  return (
    <div className="search-form search-widget">
      <input
        type="search"
        className="search-input-field"
        name={name}
        placeholder={placeholder}
        value={value}
        onBlur={onBlurHandler}
        onFocus={onFocusHandler}
        onChange={onChangeHandler}
        onClick={onClickHandler}
      />
      <button
        type="submit"
        className="button action has-icon search-button search-filter-button"
      >
        <span className="button-wrap">
          <span className="icon icon-search undefined"></span>
          <span className="visually-hidden">Search</span>
        </span>
      </button>
    </div>
  );
};
