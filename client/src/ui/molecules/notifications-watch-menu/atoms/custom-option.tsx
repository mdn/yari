import React from "react";
import { Button } from "../../../atoms/button";
import { Checkbox } from "./checkbox";

type WatchMenuOptionProps = {
  fieldName: string;
  checked: boolean;
  indeterminate?: boolean;
  toggle?: React.EventHandler<React.MouseEvent>;
  callback?: Function;
};

export function WatchMenuOption({
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
