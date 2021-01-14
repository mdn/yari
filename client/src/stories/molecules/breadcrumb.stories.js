import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { Breadcrumbs } from "../../ui/molecules/breadcrumbs";

import { breadcrumbParents } from "../mocks/breadcrumbs";

const defaults = {
  title: "Molecules/Breadcrumbs",
};

export default defaults;

export const breadcrumbs = () => {
  return (
    <Router>
      <Breadcrumbs parents={breadcrumbParents} />
    </Router>
  );
};
