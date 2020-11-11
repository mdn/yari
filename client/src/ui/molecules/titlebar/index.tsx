import React from "react";

import "./index.scss";

export function Titlebar({ docTitle, ...props }) {
  return (
    <div className="titlebar-container">
      <h1 className="title">{docTitle}</h1>
      {props.children}
    </div>
  );
}
