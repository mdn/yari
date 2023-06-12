import React from "react";
import "./index.scss";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  extraClasses?: string;
  children?: React.ReactNode;
}

export const Icon = ({
  children,
  name,
  extraClasses,
  ...attributes
}: IconProps) => {
  return (
    <span className={`icon icon-${name} ${extraClasses || ""}`} {...attributes}>
      {children}
    </span>
  );
};
