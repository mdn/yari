import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { Breadcrumbs } from "../../ui/molecules/breadcrumbs";

import { breadcrumbParents } from "../mocks/breadcrumbs";

const config = {
  title: "Molecules/Breadcrumbs",
};

export default config;

export const breadcrumbs = () => {
  return (
    <Router>
      <Breadcrumbs parents={breadcrumbParents} />
    </Router>
  );
};
