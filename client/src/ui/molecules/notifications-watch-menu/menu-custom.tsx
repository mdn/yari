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
  let custom = data?.default;
  if (data?.custom && data.custom !== true) {
    custom = data.custom;
  }

  const [content, setContent] = React.useState(!!custom?.content);
  React.useEffect(() => {
    setContent(!!custom?.content);
  }, [custom]);

  const [compatOptions, setCompatOptions] = React.useState<OptionsFormat>(
    OPTIONS.map((g) => ({
      name: g.name,
      options: g.options.map((o) => ({
        name: o,
        checked: custom?.compatibility
          ? custom.compatibility.includes(slugify(o))
          : false,
      })),
    }))
  );
  React.useEffect(() => {
    if (!custom?.compatibility) return;
    setCompatOptions((c) =>
      c.map((g) => ({
        ...g,
        options: g.options.map((o) => {
          const checked = custom.compatibility.includes(slugify(o.name));
          return { ...o, checked };
        }),
      }))
    );
  }, [custom?.compatibility]);

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
    if (saveData.current) {
      const oldCompatibility = saveData.current.compatibility;
      const newCompatibility = newSaveData.compatibility;
      oldCompatibility.sort();
      newCompatibility.sort();
      if (
        saveData.current.content !== newSaveData.content ||
        JSON.stringify(oldCompatibility) !== JSON.stringify(newCompatibility)
      ) {
        handleSelection({ custom: newSaveData });
      }
    } else {
      if (data.status !== "custom" && data.default) {
        handleSelection({ custom: data.default, custom_default: true });
      }
    }
    saveData.current = newSaveData;
  }, [content, compatOptions, handleSelection, data.status, data.default]);

  function setGlobalDefault(update?: boolean) {
    if (update || !data?.default) {
      saveData.current = {
        content,
        compatibility: compatOptions.flatMap((g) =>
          g.options.filter((o) => o.checked).map((o) => slugify(o.name))
        ),
      };
    } else {
      saveData.current = data.default;
    }
    const opts = update ? { update_custom_default: true } : {};
    handleSelection({
      custom: saveData.current,
      custom_default: true,
      ...opts,
    });
  }

  const anythingSelected =
    content || compatOptions.some((g) => g.options.some((o) => o.checked));

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
        <div className="watch-submenu-item has-dropdown">
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

      {anythingSelected && data?.custom !== true ? (
        <button
          className="button watch-submenu-item watch-submenu-setGlobal"
          onClick={(e) => {
            e.preventDefault();
            setGlobalDefault(true);
          }}
        >
          Set as your default custom settings
        </button>
      ) : null}
      {data?.default ? (
        <button
          className="button watch-submenu-item watch-submenu-setGlobal"
          onClick={(e) => {
            e.preventDefault();
            setGlobalDefault();
          }}
          disabled={data?.custom === true}
        >
          {data?.custom === true
            ? "Using your global defaults"
            : "Use your global defaults"}
        </button>
      ) : null}
    </form>
  );
}
