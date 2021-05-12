import * as React from "react";

import "./index.scss";

type DropdownProps = {
  // A string set as the id attribute to uniquely identify this
  // Dropdown component
  id?: string;
  // An optional string that, when specified, is added to the
  // the existing classes for the dropdown-menu-items element.
  // Useful when custom styling for a specific dropdown
  // component is needed.
  componentClassName?: string;
  // The string or component to display. Clicking this will
  // display the menu
  label: string | React.ReactNode;
  // An optional string that, when specified, is set as the `id` attribute
  // of the `ul` menu element. This is then also used as the value of the
  // `aria-owns` property on the menu trigger button
  ariaOwns?: string;
  // An optional string that, when specified, is used to set a custom
  // label for the menu trigger button using `aria-label`
  ariaLabel?: string;
  // If set to true, the menu will be anchored to the right edge of
  // the label and may extend beyond the left edge. If this is
  // false or unset, the default behavior is to attach the menu to
  // the left side of the label and allow it to extend beyond the
  // right edge of the label.
  right?: boolean;
  // If true, we won't show the arrow next to the menu
  hideArrow?: boolean;
  children: React.ReactNode;
};

export default function Dropdown(props: DropdownProps) {
  const [showDropdownMenu, setShowDropdownMenu] = React.useState(false);

  function hideDropdownMenuIfVisible() {
    if (showDropdownMenu) {
      setShowDropdownMenu(false);
    }
  }

  React.useEffect(() => {
    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideDropdownMenuIfVisible();
      }
    });
  });

  return (
    <div
      className={`dropdown-container ${
        props.componentClassName ? props.componentClassName : ""
      }`}
    >
      <button
        id={props.id}
        type="button"
        className="ghost dropdown-menu-label"
        aria-haspopup="true"
        aria-owns={props.ariaOwns}
        aria-label={props.ariaLabel}
        onClick={() => {
          setShowDropdownMenu(!showDropdownMenu);
        }}
      >
        {props.label}
        {!props.hideArrow && (
          <span className="dropdown-arrow-down" aria-hidden="true">
            ▼
          </span>
        )}
      </button>
      <ul
        id={props.ariaOwns}
        className={`dropdown-menu-items ${props.right ? "right" : ""} ${
          showDropdownMenu ? "show" : ""
        }`}
        role="menu"
      >
        {props.children}
      </ul>
    </div>
  );
}
