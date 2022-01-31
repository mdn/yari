import React from "react";
import { WatchMenuOption } from "./custom-option";

function checkChecked(group) {
  const checkedCount = group.options.filter((o) => o.checked).length;
  if (group.options.length === checkedCount) {
    return true;
  } else if (checkedCount) {
    return null;
  }
  return false;
}

export function CompatGroup({ group, groupCallback, optionCallback }) {
  const checked = checkChecked(group);
  const indeterminate = checked === null;
  const [open, setOpen] = React.useState(false);

  return (
    <fieldset className="watch-submenu-group">
      <WatchMenuOption
        fieldName={group.name}
        toggle={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        checked={!!checked}
        indeterminate={indeterminate}
        callback={() => groupCallback(checked)}
      />
      {open && (
        <ul>
          {group.options.map((option, index) => (
            <li key={`CompatInterface-${index}`}>
              <WatchMenuOption
                fieldName={option.name}
                checked={option.checked}
                callback={() => optionCallback(option, option.checked)}
              />
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
