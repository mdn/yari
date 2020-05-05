import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { BrowserCompatibilityTable } from "./index";

function renderWithRouter(component) {
  return render(<MemoryRouter>{component}</MemoryRouter>);
}

it("renders error boundary when no data is present", () => {
  const { getByText } = renderWithRouter(<BrowserCompatibilityTable />);
  expect(getByText(/this table has encountered unhandled error/));
  // TODO: When `BrowserCompatibilityErrorBoundary` reports to Sentry, spy on the report function so that we can assert the error stack
});
