import React from "react";

import "./titlebar.scss";

export default function Titlebar({ docTitle }) {
  return (
    <div className="titlebar-container">
      <h1 className="title">{docTitle}</h1>
    </div>
  );
}
