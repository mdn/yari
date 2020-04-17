import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { BrowserCompatibilityErrorBoundary } from "./error-boundary";

it("renders without crashing", () => {
  const { container } = render(
    <BrowserCompatibilityErrorBoundary>
      <div />
    </BrowserCompatibilityErrorBoundary>
  );
  expect(container).toBeDefined();
});

it("renders crashing mock component", () => {
  const CrashingComponent = function () {
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

  const { container } = render(
    <BrowserCompatibilityErrorBoundary>
      <CrashingComponent />
    </BrowserCompatibilityErrorBoundary>
  );
  expect(container.querySelector(".bc-table-error-boundary")).toBeNull();
  const div = container.querySelector("div");
  div && fireEvent.click(div);

  // TODO: When `BrowserCompatibilityErrorBoundary` reports to Sentry, spy on the report function so that we can assert the error stack
  expect(container.querySelector(".bc-table-error-boundary")).toBeDefined();
});
