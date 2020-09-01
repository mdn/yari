import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import Breadcrumbs from "./breadcrumbs";

describe("Breadcrumbs", () => {
  const mockParents = [
    {
      title: "crumb 1",
      uri: "/url-1",
    },
    {
      title: "crumb 2",
      uri: "/url-2",
    },
    {
      title: "crumb 3",
      uri: "/url-3",
    },
  ];

  it("renders correct number of crumbs (parents + current page)", () => {
    const expected = mockParents.length;
    render(
      <Router>
        <Breadcrumbs parents={mockParents} />
      </Router>
    );

    const items = screen.getAllByRole("link");
    expect(items).toHaveLength(expected);
  });

  it("gives the last parent a different class name, so we can style it differently for small screens", () => {
    const expected = "breadcrumb";
    const firstParent = mockParents[0];
    const lastParent = mockParents[mockParents.length - 1];

    render(
      <Router>
        <Breadcrumbs parents={mockParents} />
      </Router>
    );

    const firstElement = screen.queryByText(firstParent.title);
    const lastElement = screen.queryByText(lastParent.title);

    if (firstElement) {
      const firstAnchor = firstElement.closest("a");
      expect(firstAnchor).toHaveClass(expected);
    }

    if (lastElement) {
      const lastAnchor = lastElement.closest("a");
      expect(lastAnchor).not.toHaveClass(expected);
    }
  });
});
