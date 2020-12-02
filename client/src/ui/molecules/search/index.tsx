import * as React from "react";

import { SearchNavigateWidget } from "../../../search";

import "./index.scss";

export function Search(props) {
  return (
    <div className="header-search">
      <SearchNavigateWidget {...props} />
    </div>
  );
}
