import { MENU } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";
import { MenuEntry, Submenu } from "../submenu";
import "./index.scss";

interface MenuProps {
  menu: MenuEntry;
  isOpen: boolean;
  toggle: (id: string) => void;
}

export const Menu = ({ menu, isOpen, toggle }: MenuProps) => {
  const gleanClick = useGleanClick();

  const buttonId = `${menu.id}-button`;
  const submenuId = `${menu.id}-menu`;

  const hasAnyDot = menu.items.some((item) => item.dot);

  return (
    <li key={menu.id} className="top-level-entry-container">
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
            gleanClick(`${MENU.CLICK_MENU}: ${menu.to}`);
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
