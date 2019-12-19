import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { BrowserCompatibilityErrorBoundary } from "./error-boundary.js";

it("renders without crashing", () => {
  const { container } = render(
    <BrowserCompatibilityErrorBoundary>
      <div />
    </BrowserCompatibilityErrorBoundary>
  );
  expect(container).toBeDefined();
});

it("renders crashing mock component", () => {
  const CrashingComponent = function() {
    const [crashing, setCrashing] = React.useState(false);

    if (crashing) {
      throw new Error("42");
    }
    return (
      <div
        onClick={() => {
          setCrashing(true);
        }}
      />
    );
  };

  // The ErrorBoundary component deliberately uses console.error(). Let's
  // silence that during this test so it won't spook us.
  const originalError = console.error;
  console.error = jest.fn();

  const { container } = render(
    <BrowserCompatibilityErrorBoundary>
      <CrashingComponent />
    </BrowserCompatibilityErrorBoundary>
  );

  expect(container.querySelector(".bc-table-error-boundary")).toBeNull();
  const div = container.querySelector("div");
  fireEvent.click(div);

  // TODO: When `BrowserCompatibilityErrorBoundary` reports to Sentry, spy on the report function so that we can assert the error stack
  expect(container.querySelector(".bc-table-error-boundary")).toBeDefined();

  console.error = originalError;
});
