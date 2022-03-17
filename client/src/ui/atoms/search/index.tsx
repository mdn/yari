import * as React from "react";

import "./index.scss";

type SearchProps = {
  name: string;
  extraClasses?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  /**
   * Should the button be disabled? This is optional with a default of false
   */
  isDisabled?: boolean;
  onBlurHandler?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChangeHandler?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClickHandler?: (event: React.MouseEvent<Element>) => void;
  onFocusHandler?: (event: React.FocusEvent<Element>) => void;
  size?: "small" | "medium";
  state?: "default" | "hover" | "active" | "focused" | "inactive";
};

export const Search = ({
  name,
  extraClasses,
  id,
  isDisabled,
  onBlurHandler,
  onChangeHandler,
  onClickHandler,
  onFocusHandler,
  placeholder,
  size,
  state,
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
