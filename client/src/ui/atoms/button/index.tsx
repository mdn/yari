import * as React from "react";
import { Link } from "react-router-dom";

import { Icon } from "../icon";

import "./index.scss";

type ButtonProps = {
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: "true" | "false" | "menu" | "dialog" | "listbox";

  type?: "primary" | "secondary" | "action";

  /**
   * The `type` of the button. Not used with links.
   */
  buttonType?: "button" | "submit" | "reset";
  extraClasses?: string;
  href?: string;
  icon?: string;

  id?: string;
  /**
   * Should the button be disabled? This is optional with a default of false
   */
  isDisabled?: boolean;
  onClickHandler?: (event: React.MouseEvent<Element>) => void;
  onFocusHandler?: (event: React.FocusEvent<Element>) => void;

  size?: "small" | "medium";

  state?: "default" | "hover" | "active" | "focused" | "inactive";
  children?: React.ReactNode;
};

export const Button = ({
  ariaControls,
  ariaExpanded,
  ariaHasPopup,
  type = "primary",
  buttonType = "button",
  extraClasses,
  href,
  icon,
  id,
  isDisabled = false,
  onClickHandler,
  onFocusHandler,
  size,
  state,
  children,
}: ButtonProps) => {
  let buttonClasses = "button";
  [type, size, state].forEach((attr) => {
    if (attr) {
      buttonClasses += ` ${attr}`;
    }
  });

  if (extraClasses) {
    buttonClasses += ` ${extraClasses}`;
  }

  function renderContent() {
    if (icon) {
      return (
        <>
          <Icon name={icon} />
          {children}
        </>
      );
    }

    return children;
  }

  if (href) {
    return (
      <Link
        to={href}
        className={buttonClasses}
        id={id}
        onClick={onClickHandler}
        onFocus={onFocusHandler}
      >
        <span className="button-wrap">{renderContent()}</span>
      </Link>
    );
  }
  return (
    <button
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      disabled={isDisabled}
      id={id}
      type={buttonType}
      className={buttonClasses}
      onClick={onClickHandler}
      onFocus={onFocusHandler}
    >
      <span className="button-wrap">{renderContent()}</span>
    </button>
  );
};
