import React from "react";
import { render } from "@testing-library/react";
import { BrowserCompatibilityTable } from "./index";

it("renders error boundary when no data is present", () => {
  const { container } = render(<BrowserCompatibilityTable />);
  expect(container.querySelector(".bc-table")).toBeNull();
  expect(container.querySelector(".bc-table-error-boundary")).toBeDefined();
  // TODO: When `BrowserCompatibilityErrorBoundary` reports to Sentry, spy on the report function so that we can assert the error stack
});
