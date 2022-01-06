import React from "react";
import { Icon } from "../../atoms/icon";
import { Checkbox } from "./atoms/checkbox";
import { CompatGroup } from "./atoms/custom-option-group";
import { WatchMenuOption } from "./atoms/custom-option";

const OPTIONS = [
  {
    name: "Desktop",
    options: ["Chrome", "Edge", "Firefox"],
  },
  {
    name: "Mobile",
    options: ["WebView Android", "Chrome Android"],
  },
  {
    name: "Server",
    options: ["Deno", "Node.js"],
  },
];

type OptionsFormat = {
  name: string;
  options: {
    name: string;
    checked: boolean;
  }[];
}[];

const slugify = (text: string) => text.toLowerCase().replace(/ /g, "_");

export function NotificationsWatchMenuCustom({
  data,
  setStepHandler,
  handleSelection,
}) {
  const [content, setContent] = React.useState(false);
  React.useEffect(() => {
    setContent(!!data.content);
  }, [data]);

  const [compatOptions, setCompatOptions] = React.useState<OptionsFormat>(
    OPTIONS.map((g) => ({
      name: g.name,
      options: g.options.map((o) => ({ name: o, checked: false })),
    }))
  );
  React.useEffect(() => {
    console.log(data);
    if (!data?.compatibility) return;
    setCompatOptions((c) =>
      c.map((g) => ({
        ...g,
        options: g.options.map((o) => {
          const checked = !!data.compatibility.includes(slugify(o.name));
          return { ...o, checked };
        }),
      }))
    );
  }, [data]);

  const saveData = React.useRef<{
    content: boolean;
    compatibility: string[];
  }>();
  React.useEffect(() => {
    const newSaveData = {
      content,
      compatibility: compatOptions.flatMap((g) =>
        g.options.filter((o) => o.checked).map((o) => slugify(o.name))
      ),
    };
    if (
      saveData.current &&
      JSON.stringify(saveData.current) !== JSON.stringify(newSaveData)
    ) {
      handleSelection(newSaveData);
    }
    saveData.current = newSaveData;
  }, [content, compatOptions, handleSelection]);

  function setGlobalDefault() {}

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
          setContent((c) => !c);
        }}
      />

      <fieldset className="watch-submenu-group">
        <div className="watch-submenu-item">
          <Checkbox
            id="customize_browser_compat"
            name="CustomizeBrowserCompat"
            indeterminate={
              !compatOptions.every((cat) =>
                cat.options.every((o) => o.checked)
              ) &&
              compatOptions.some((cat) => cat.options.some((o) => o.checked))
            }
            checked={compatOptions.every((cat) =>
              cat.options.every((o) => o.checked)
            )}
            onChange={(e) => {
              // Bulk change every compatibility option to true / false.
              setCompatOptions((c) =>
                c.map((cat) => ({
                  ...cat,
                  options: cat.options.map((o) => ({
                    ...o,
                    checked: e.target.checked,
                  })),
                }))
              );
            }}
          >
            Browser Compatability Data
          </Checkbox>
        </div>

        {compatOptions.map((group, index) => (
          <CompatGroup
            group={group}
            key={`CompatCat-${index}`}
            groupCallback={(checked) => {
              // Change every compatibility option in this group to true / false.
              setCompatOptions((c) => {
                const compatOptionsCopy = JSON.parse(JSON.stringify(c));
                const groupCopy = compatOptionsCopy.find(
                  (g) => g.name === group.name
                );
                if (groupCopy) {
                  groupCopy.options.map((o) => (o.checked = !checked));
                }
                return compatOptionsCopy;
              });
            }}
            optionCallback={(option, checked) => {
              // Change this compatibility option to true / false.
              setCompatOptions((c) => {
                const compatOptionsCopy = JSON.parse(JSON.stringify(c));
                const groupCopy = compatOptionsCopy.find(
                  (g) => g.name === group.name
                );
                if (groupCopy) {
                  const optionCopy = groupCopy.options.find(
                    (o) => o.name === option.name
                  );
                  if (optionCopy) {
                    optionCopy.checked = !checked;
                  }
                }
                return compatOptionsCopy;
              });
            }}
          />
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
