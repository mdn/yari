type WatchMenuOptionProps = {
  fieldName: string;
  checked: boolean;
};

export function NotificationsWatchMenuCustom({ setStepHandler }) {
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
          checked: true,
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

  function WatchMenuOption({ fieldName, checked }: WatchMenuOptionProps) {
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
      </div>
    );
  }

  return (
    <form>
      <button onClick={setStepHandler} className="watch-submenu-header">
        Notifications
      </button>

      <WatchMenuOption fieldName={"Content Updates"} checked={false} />

      <fieldset>
        <div className="watch-submenu-item">
          <input
            type="checkbox"
            id="customize_browser_compat"
            name="CustomizeBrowserCompat"
          />
          <label htmlFor="customize_browser_compat">
            Browser Compatability Data
          </label>
        </div>

        {compatOptions.map((option, index) => (
          <fieldset key={`CompatCat-${index}`}>
            <WatchMenuOption fieldName={option.name} checked={option.checked} />
            <ul>
              {option.interfaces.map((interfaceOption, index) => (
                <WatchMenuOption
                  key={`CompatInterface-${index}`}
                  fieldName={interfaceOption.name}
                  checked={interfaceOption.checked}
                />
              ))}
            </ul>
          </fieldset>
        ))}
      </fieldset>

      <button>Set as global default</button>
    </form>
  );
}
