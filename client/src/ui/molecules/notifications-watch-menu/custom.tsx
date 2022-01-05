import React from "react";
import { Button } from "../../atoms/button";
import { Icon } from "../../atoms/icon";

type WatchMenuOptionProps = {
  fieldName: string;
  checked: boolean;
  indeterminate?: boolean;
  toggle?: React.EventHandler<React.MouseEvent>;
  callback?: Function;
};

type CheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  id?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

function Checkbox({
  checked,
  indeterminate,
  children,
  id,
  name,
  onChange,
}: React.PropsWithChildren<CheckboxProps>) {
  return (
    <>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        aria-checked={checked}
        ref={(el) => el && (el.indeterminate = !!indeterminate)}
        onChange={onChange}
      />
      {children && <label htmlFor={id}>{children}</label>}
    </>
  );
}

export function NotificationsWatchMenuCustom({
  data,
  setStepHandler,
  handleSelection,
}) {
  const compat = data.compatibility || {};
  const [content, setContent] = React.useState(!!data.content);
  const [compatOpen, setCompatOpen] = React.useState<string[]>([]);
  const [compatOptions, setCompatOptions] = React.useState([
    {
      name: "Desktop",
      interfaces: [
        {
          name: "Chrome",
          checked: !!compat.chrome,
        },
        {
          name: "Edge",
          checked: !!compat.edge,
        },
        {
          name: "Firefox",
          checked: !!compat.firefox,
        },
      ],
    },
    {
      name: "Mobile",
      interfaces: [
        {
          name: "WebView Android",
          checked: !!compat.webview_android,
        },
        {
          name: "Chrome Android",
          checked: !!compat.chrome_android,
        },
      ],
    },
    {
      name: "Server",
      interfaces: [
        {
          name: "Deno",
          checked: !!compat.deno,
        },
        {
          name: "Node.js",
          checked: !!compat["node.js"],
        },
      ],
    },
  ]);

  function handleOptionChange() {
    handleSelection({
      content,
      compatibility: compatOptions.flatMap((opt) =>
        opt.interfaces
          .filter((o) => o.checked)
          .map((o) => o.name.toLowerCase().replace(/ /g, "_"))
      ),
    });
  }

  function setGlobalDefault() {}

  function WatchMenuOption({
    fieldName,
    checked,
    indeterminate,
    toggle,
    callback,
  }: WatchMenuOptionProps) {
    const formattedFieldName = `customize_${fieldName
      .toLowerCase()
      .replace(/ /g, "_")}`;
    return (
      <div className="watch-submenu-item">
        <Checkbox
          id={formattedFieldName}
          name={formattedFieldName}
          checked={checked}
          indeterminate={indeterminate}
          onChange={(e) => {
            callback && callback(e);
          }}
        >
          {fieldName}
        </Checkbox>

        {toggle && (
          <Button
            type="action"
            extraClasses="small"
            icon="chevron"
            onClickHandler={toggle}
          ></Button>
        )}
      </div>
    );
  }
  function CompatOption({ option }) {
    function checkChecked() {
      const checkedCount = option.interfaces.filter((o) => o.checked).length;
      if (option.interfaces.length === checkedCount) {
        return true;
      } else if (checkedCount) {
        return null;
      }
      return false;
    }

    const [checked, setChecked] = React.useState(!!checkChecked());
    const [indeterminate, setIndeterminate] = React.useState(
      checkChecked() == null
    );

    return (
      <fieldset className="watch-submenu-group">
        <WatchMenuOption
          fieldName={option.name}
          toggle={(e) => {
            e.preventDefault();
            if (compatOpen.includes(option.name)) {
              setCompatOpen(compatOpen.filter((o) => o !== option.name));
            } else {
              setCompatOpen([...compatOpen, option.name]);
            }
          }}
          checked={checked}
          indeterminate={indeterminate}
          callback={() => {
            option.interfaces.map((o) => (o.checked = !checked));
            handleOptionChange();
            setCompatOptions([...compatOptions]);
          }}
        />
        {compatOpen.includes(option.name) && (
          <ul>
            {option.interfaces.map((interfaceOption, index) => (
              <li key={`CompatInterface-${index}`}>
                <WatchMenuOption
                  fieldName={interfaceOption.name}
                  checked={interfaceOption.checked}
                  callback={(e) => {
                    interfaceOption.checked = e.target.checked;
                    const checked = checkChecked();
                    setChecked(!!checked);
                    setIndeterminate(checked == null);
                    setCompatOptions([...compatOptions]);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    );
  }

  return (
    <form>
      <button
        onClick={(e) => {
          e.preventDefault();
          setStepHandler(0);
        }}
        className="watch-submenu-header"
      >
        <span className="watch-submenu-header-wrap">
          <Icon name="chevron" />
          Customize Notifications
        </span>
      </button>

      <WatchMenuOption
        fieldName={"Content Updates"}
        checked={content}
        callback={() => {
          setContent(!content);
          handleOptionChange();
        }}
      />

      <fieldset className="watch-submenu-group">
        <div className="watch-submenu-item">
          <Checkbox
            id="customize_browser_compat"
            name="CustomizeBrowserCompat"
            indeterminate={
              !compatOptions.every((cat) =>
                cat.interfaces.every((o) => o.checked)
              ) &&
              compatOptions.some((cat) => cat.interfaces.some((o) => o.checked))
            }
            checked={compatOptions.every((cat) =>
              cat.interfaces.every((o) => o.checked)
            )}
            onChange={(e) => {
              compatOptions.map((cat) =>
                cat.interfaces.map((o) => (o.checked = e.target.checked))
              );
              setCompatOptions([...compatOptions]);
            }}
          >
            Browser Compatability Data
          </Checkbox>
        </div>

        {compatOptions.map((option, index) => (
          <CompatOption option={option} key={`CompatCat-${index}`} />
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
