import React from "react";
import { withA11y } from "@storybook/addon-a11y";

import SearchHeader from "./search-header.jsx";

export default {
  title: "Molecules|Search Header",
  decorators: [withA11y]
};

export const searchHeader = () => <SearchHeader initialQuery="" />;
