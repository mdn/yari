import { useLocation } from "react-router";
import { MENU } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";
import { MenuEntry, Submenu } from "../submenu";
import "./index.scss";

interface MenuProps {
  menu: MenuEntry;
  isActive?: boolean;
  isOpen: boolean;
  toggle: (id: string) => void;
}

export const Menu = ({
  menu,
  isActive = undefined,
  isOpen,
  toggle,
}: MenuProps) => {
  const { pathname } = useLocation();
  const gleanClick = useGleanClick();

  const buttonId = `${menu.id}-button`;
  const submenuId = `${menu.id}-menu`;

  isActive =
    isActive ??
    (typeof menu.to === "string"
      ? pathname.startsWith(menu.to.split("#", 2)[0])
      : menu.items.some((item) => item.url && pathname.startsWith(item.url)));
  const hasAnyDot = menu.items.some((item) => item.dot);

  return (
    <li
      key={menu.id}
      className={`top-level-entry-container ${isActive ? "active" : ""}`}
    >
      {hasAnyDot && (
        <span className="visually-hidden top-level-entry-dot"></span>
      )}
      <button
        type="button"
        id={buttonId}
        className="top-level-entry menu-toggle"
        aria-controls={submenuId}
        aria-expanded={isOpen}
        onClick={() => {
          toggle(menu.id);
        }}
      >
        {menu.label}
      </button>

      {menu.to && (
        <a
          href={menu.to}
          className="top-level-entry"
          onClick={() => {
            gleanClick(`${MENU.CLICK_MENU}: ${menu.id} -> ${menu.to}`);
            // @ts-ignore
            document?.activeElement?.blur();
          }}
        >
          {menu.label}
        </a>
      )}

      <Submenu
        submenuId={submenuId}
        menuEntry={menu}
        defaultHidden={!isOpen}
        extraClasses="inline-submenu-lg"
      />
    </li>
  );
};
