import * as React from "react";

import "./index.scss";

type SearchProps = {
  name: string;
  placeholder?: string;
  value?: string;
  isDisabled?: boolean;
  onBlurHandler?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChangeHandler?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClickHandler?: (event: React.MouseEvent<Element>) => void;
  onFocusHandler?: (event: React.FocusEvent<Element>) => void;
  onResetHandler?: () => void;
};

export const Search = ({
  name,
  isDisabled = false,
  onBlurHandler,
  onChangeHandler,
  onClickHandler,
  onFocusHandler,
  onResetHandler,
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
        disabled={isDisabled}
        onBlur={(e) =>
          onBlurHandler &&
          !e.currentTarget.parentElement?.contains(e.relatedTarget) &&
          onBlurHandler(e)
        }
        onFocus={onFocusHandler}
        onChange={onChangeHandler}
        onClick={onClickHandler}
      />

      {onResetHandler && (
        <button
          type="button"
          className="button action has-icon clear-search-button"
          onClick={onResetHandler}
        >
          <span className="button-wrap">
            <span className="icon icon-cancel"></span>
            <span className="visually-hidden">Clear search input</span>
          </span>
        </button>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        className="button action has-icon search-button search-filter-button"
      >
        <span className="button-wrap">
          <span className="icon icon-search"></span>
          <span className="visually-hidden">Search</span>
        </span>
      </button>
    </div>
  );
};
