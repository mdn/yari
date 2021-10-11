import * as React from "react";

type ButtonProps = {
  ariaExpanded?: boolean;
  ariaHasPopup?: "true" | "false" | "menu" | "dialog" | "listbox";
  /**
   * The `type` of the button
   */
  buttonType?: "button" | "submit" | "reset";
  extraClasses?: string;
  id?: string;
  onClickHandler?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocusHandler?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  /**
   * The button state.
   * Available options are:
   * `positive`, `danger`, `outline`, `ghost`, `inactive`
   * Combinations are also possible such as:
   * `outline positive`
   */
  state?: string;
  children: React.ReactNode;
};

export const Button = ({
  ariaExpanded,
  ariaHasPopup,
  buttonType = "button",
  extraClasses,
  id,
  onClickHandler,
  onFocusHandler,
  state,
  children,
}: ButtonProps) => {
  return (
    <button
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      id={id}
      type={buttonType}
      className={`${state ? state : ""} ${extraClasses ? extraClasses : ""}`}
      onClick={onClickHandler}
      onFocus={onFocusHandler}
    >
      {children}
    </button>
  );
};
