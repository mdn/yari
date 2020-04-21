import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { BrowserCompatibilityTable } from "./index.js";

function renderWithRouter(component) {
  return render(<MemoryRouter>{component}</MemoryRouter>);
}

it("renders error boundary when no data is present", () => {
  const { container } = renderWithRouter(<BrowserCompatibilityTable />);
  expect(container.querySelector(".bc-table")).toBeNull();
  expect(container.querySelector(".bc-table-error-boundary")).toBeDefined();
  // TODO: When `BrowserCompatibilityErrorBoundary` reports to Sentry, spy on the report function so that we can assert the error stack
});
