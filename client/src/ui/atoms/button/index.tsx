import * as React from "react";
import { Icon } from "../icon";
import InternalLink from "../internal-link";

import "./index.scss";

type ButtonProps = {
  title?: string;

  type?: "primary" | "secondary" | "action" | "select" | "link";

  /**
   * The `type` of the button. Not used with links.
   */
  buttonType?: "button" | "submit" | "reset";
  name?: string;
  extraClasses?: string | null;
  href?: string;
  target?: string;
  rel?: string;
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
  value?: string;
  children?: React.ReactNode;
};

export const Button = ({
  title,
  name,
  type = "primary",
  buttonType = "button",
  extraClasses,
  href,
  target,
  rel,
  icon,
  id,
  isDisabled = false,
  onClickHandler,
  onFocusHandler,
  size,
  state,
  value,
  children,
  ...passthroughAttrs
}: ButtonProps) => {
  let buttonClasses = "button";
  [type, size, state].forEach((attr) => {
    if (attr) {
      buttonClasses += ` ${attr}`;
    }
  });

  buttonClasses += icon ? " has-icon" : "";
  buttonClasses += extraClasses ? ` ${extraClasses}` : "";

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
    if (target) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={buttonClasses}
          id={id}
          onClick={onClickHandler}
          onFocus={onFocusHandler}
          title={title}
          {...passthroughAttrs}
        >
          <span className="button-wrap">{renderContent()}</span>
        </a>
      );
    }
    return (
      <InternalLink
        to={href}
        rel={rel}
        className={buttonClasses}
        id={id}
        onClick={onClickHandler}
        onFocus={onFocusHandler}
        title={title}
        {...passthroughAttrs}
      >
        <span className="button-wrap">{renderContent()}</span>
      </InternalLink>
    );
  }
  return (
    <button
      title={title}
      disabled={isDisabled}
      id={id}
      type={buttonType}
      className={buttonClasses}
      onClick={onClickHandler}
      onFocus={onFocusHandler}
      value={value}
      name={name}
      {...passthroughAttrs}
    >
      <span className="button-wrap">{renderContent()}</span>
    </button>
  );
};
