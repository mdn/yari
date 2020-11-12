import * as React from "react";

import { SearchNavigateWidget, BasicSearchWidget } from "../../../search";
import { CRUD_MODE } from "../../../constants";

import "./index.scss";

export function Search(props) {
  return (
    <div className="header-search">
      {/* See the code comment next to the <BasicSearchWidget> component */}
      {CRUD_MODE ? <SearchNavigateWidget {...props} /> : <BasicSearchWidget />}
    </div>
  );
}
