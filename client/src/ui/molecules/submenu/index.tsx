import "./index.scss";
import { useOnClickOutside } from "../../../hooks";
import React from "react";

type SubmenuItem = {
  component?: () => JSX.Element;
  description?: string;
  extraClasses?: string;
  hasIcon?: boolean;
  iconClasses?: string;
  label?: string;
  subText?: string;
  url?: string;
};

type MenuEntry = {
  id: string;
  items: SubmenuItem[];
  label: string;
};

export const Submenu = ({
  menuEntry,
  onBlurHandler,
  visibleSubMenuId,
}: {
  menuEntry: MenuEntry;
  onBlurHandler?: () => void;
  visibleSubMenuId: string | null;
}) => {
  const submenuRef = React.useRef(null);
  useOnClickOutside(submenuRef, onBlurHandler);

  return (
    <ul
      ref={submenuRef}
      className={`submenu ${menuEntry.id} ${
        menuEntry.id === visibleSubMenuId ? "show" : ""
      }`}
      role="menu"
      aria-labelledby={`${menuEntry.id}-button`}
    >
      {menuEntry.items &&
        menuEntry.items.map((item, index) => {
          const key = `${menuEntry.id}-${index}`;
          return (
            <li
              key={key}
              role="none"
              className={item.extraClasses || undefined}
            >
              {item.component ? (
                <item.component key={key} />
              ) : item.url ? (
                <a
                  href={item.url}
                  className="submenu-item"
                  onBlur={onBlurHandler}
                  role="menuitem"
                >
                  {item.hasIcon && <div className={item.iconClasses}></div>}
                  <div className="submenu-content-container">
                    <div className="submenu-item-heading">{item.label}</div>
                    {item.description && (
                      <p className="submenu-item-description">
                        {item.description}
                      </p>
                    )}
                    {item.subText && (
                      <span className="submenu-item-subtext">
                        {item.subText}
                      </span>
                    )}
                  </div>
                </a>
              ) : (
                <div key={key} className="submenu-item">
                  {item.hasIcon && <div className={item.iconClasses}></div>}
                  <div className="submenu-content-container">
                    <div className="submenu-item-heading">{item.label}</div>
                    {item.description && (
                      <p className="submenu-item-description">
                        {item.description}
                      </p>
                    )}
                    {item.subText && (
                      <span className="submenu-item-subtext">
                        {item.subText}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
    </ul>
  );
};
