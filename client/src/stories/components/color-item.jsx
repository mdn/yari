import React from "react";

export const ColorItem = ({
  backgroundColor,
  sassVariable,
  jsVariable,
  color = "#fff",
}) => {
  return (
    <>
      <div
        className="swatch"
        style={{ backgroundColor: backgroundColor, color: color }}
      >
        <ul className="color-names">
          <li>
            SASS: <code>{sassVariable}</code>
          </li>
          <li>
            JS: <code>{jsVariable}</code>
          </li>
        </ul>
      </div>
    </>
  );
};
