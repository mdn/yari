import "./index.scss";

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
  return (
    <ul
      className={`submenu ${menuEntry.id} ${
        menuEntry.id === visibleSubMenuId ? "show" : ""
      }`}
      role="menu"
      aria-labelledby={`${menuEntry.id}-button`}
    >
      {menuEntry.items &&
        menuEntry.items.map((item, index) => (
          <li
            key={item.url}
            role="none"
            className={item.extraClasses || undefined}
          >
            {item.component ? (
              <item.component />
            ) : item.url ? (
              <a href={item.url} onBlur={onBlurHandler} role="menuitem">
                {item.hasIcon && <div className={item.iconClasses}></div>}
                <div className="submenu-content-container">
                  <div className="submenu-item-heading">{item.label}</div>
                  {item.description && (
                    <p className="submenu-item-description">
                      {item.description}
                    </p>
                  )}
                  {item.subText && (
                    <span className="submenu-item-subtext">{item.subText}</span>
                  )}
                </div>
              </a>
            ) : (
              <div key={`${menuEntry.id}-${index}`}>
                {item.hasIcon && <div className={item.iconClasses}></div>}
                <div className="submenu-content-container">
                  <div className="submenu-item-heading">{item.label}</div>
                  {item.description && (
                    <p className="submenu-item-description">
                      {item.description}
                    </p>
                  )}
                  {item.subText && (
                    <span className="submenu-item-subtext">{item.subText}</span>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
    </ul>
  );
};
