import * as React from "react";

type ButtonProps = {
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: "true" | "false" | "menu" | "dialog" | "listbox";
  /**
   * The `type` of the button
   */
  buttonType?: "button" | "submit" | "reset";
  extraClasses?: string;
  id?: string;
  /**
   * Should the button be disabled? This is optional with a default of false
   */
  isDisabled?: boolean;
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
  ariaControls,
  ariaExpanded,
  ariaHasPopup,
  buttonType = "button",
  extraClasses,
  id,
  isDisabled = false,
  onClickHandler,
  onFocusHandler,
  state,
  children,
}: ButtonProps) => {
  return (
    <button
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      disabled={isDisabled}
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
