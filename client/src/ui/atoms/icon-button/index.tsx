import * as React from "react";

import "./index.scss";

type IconButtonType = {
  ariaHasPopup?: "true" | "false" | "menu" | "dialog" | "listbox";
  buttonType?: "button" | "submit" | "reset";
  clickHandler?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  extraClasses?: string;
  iconClassName?: string;
};

export const IconButton = (props) => {
  const {
    ariaHasPopup,
    buttonType = "button",
    clickHandler,
    extraClasses,
    iconClassName,
  }: IconButtonType = props;

  return (
    <button
      aria-haspopup={ariaHasPopup}
      type={buttonType}
      onClick={clickHandler}
      className={`${extraClasses} icon-button ${iconClassName}`}
    >
      {props.children}
    </button>
  );
};
