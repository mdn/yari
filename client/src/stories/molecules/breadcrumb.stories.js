import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { Breadcrumbs } from "../../ui/molecules/breadcrumbs";

export default {
  title: "Molecules/Breadcrumbs",
};

const parents = [
  {
    uri: "/en-US/docs/Web",
    title: "Web technology for developers",
  },
  {
    uri: "/en-US/docs/Web/HTML",
    title: "HTML: Hypertext Markup Language",
  },
  {
    uri: "/en-US/docs/Web/HTML/Element",
    title: "HTML elements reference",
  },
  {
    uri: "/en-US/docs/Web/HTML/Element/audio",
    title: "<audio>: The Embed Audio element",
  },
];

export const breadcrumbs = () => {
  return (
    <Router>
      <Breadcrumbs parents={parents} />
    </Router>
  );
};
