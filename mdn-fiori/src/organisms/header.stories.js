import React from "react";
import { withA11y } from "@storybook/addon-a11y";

import Header from "./header.jsx";

export default {
  title: "Organisms|Header",
  decorators: [withA11y]
};

export const header = () => (
  <>
    <Header />
    <div className="page-overlay hidden"></div>
  </>
);
