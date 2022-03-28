import * as React from "react";

import "./index.scss";

type SelectProps = {
  name: string;
  extraClasses?: string | null;
  id?: string;
  /**
   * Should the button be disabled? This is optional with a default of false
   */
  isDisabled?: boolean;
  onClickHandler?: (event: React.MouseEvent<Element>) => void;
  onFocusHandler?: (event: React.FocusEvent<Element>) => void;
  size?: "small" | "medium";
  state?: "default" | "hover" | "active" | "focused" | "inactive";
  children?: React.ReactNode;
};

export const Select = ({ extraClasses, id, children }: SelectProps) => {
  return (
    <select className={extraClasses || ""} id={id}>
      {children}
    </select>
  );
};
