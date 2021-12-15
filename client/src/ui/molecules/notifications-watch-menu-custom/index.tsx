import { Button } from "../../atoms/button";
import { Icon } from "../../atoms/icon";

type WatchMenuOptionProps = {
  fieldName: string;
  checked?: boolean;
  hasToggle?: boolean;
};

export function NotificationsWatchMenuCustom({ doc, setStepHandler }) {
  let compatOptions = [
    {
      name: "Desktop",
      checked: false,
      interfaces: [
        {
          name: "Chrome",
          checked: true,
        },
        {
          name: "Edge",
          checked: false,
        },
        {
          name: "Firefox",
          checked: true,
        },
      ],
    },
    {
      name: "Mobile",
      checked: false,
      interfaces: [
        {
          name: "WebView Android",
          checked: true,
        },
        {
          name: "Chrome Android",
          checked: false,
        },
      ],
    },
    {
      name: "Server",
      checked: true,
      interfaces: [
        {
          name: "Deno",
          checked: false,
        },
        {
          name: "Node.js",
          checked: true,
        },
      ],
    },
  ];

  function handleOptionChange(fieldName) {
    // Update backend that field changed
    // Trigger re-draw of custom watch menu
  }

  function setGlobalDefault() {}

  function WatchMenuOption({
    fieldName,
    checked,
    hasToggle,
  }: WatchMenuOptionProps) {
    const formattedFieldName = `customize_${fieldName
      .toLowerCase()
      .replace(/ /g, "_")}`;
    return (
      <div className="watch-submenu-item">
        <input
          type="checkbox"
          id={formattedFieldName}
          name={formattedFieldName}
          aria-checked={checked}
          checked={checked}
          onChange={() => {
            handleOptionChange(formattedFieldName);
          }}
        />
        <label htmlFor={formattedFieldName}>{fieldName}</label>

        {hasToggle && (
          <Button type="action" extraClasses="small" icon="chevron"></Button>
        )}
      </div>
    );
  }

  return (
    <form>
      <button onClick={setStepHandler} className="watch-submenu-header">
        <span className="watch-submenu-header-wrap">
          <Icon name="chevron" />
          Customize Notifications
        </span>
      </button>

      <WatchMenuOption fieldName={"Content Updates"} />

      <fieldset className="watch-submenu-group">
        <div className="watch-submenu-item">
          <input
            type="checkbox"
            id="customize_browser_compat"
            name="CustomizeBrowserCompat"
          />
          <label htmlFor="customize_browser_compat">
            Browser Compatability Data
          </label>

          <Button
            type="action"
            extraClasses="small"
            ariaLabel="Toggle browser compatability data options"
            icon="chevron"
          ></Button>
        </div>

        {compatOptions.map((option, index) => (
          <fieldset className="watch-submenu-group" key={`CompatCat-${index}`}>
            <WatchMenuOption fieldName={option.name} hasToggle={true} />
            <ul>
              {option.interfaces.map((interfaceOption, index) => (
                <li key={`CompatInterface-${index}`}>
                  <WatchMenuOption fieldName={interfaceOption.name} />
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </fieldset>

      <button
        className="watch-submenu-item watch-submenu-setGlobal"
        onClick={setGlobalDefault}
      >
        Set as global default
      </button>
    </form>
  );
}
