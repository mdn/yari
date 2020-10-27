import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { Breadcrumbs } from "../../ui/molecules/breadcrumbs";

import { breadcrumbParents } from "../mocks/breadcrumbs";

export default {
  title: "Molecules/Breadcrumbs",
};

export const breadcrumbs = () => {
  return (
    <Router>
      <Breadcrumbs parents={breadcrumbParents} />
    </Router>
  );
};
