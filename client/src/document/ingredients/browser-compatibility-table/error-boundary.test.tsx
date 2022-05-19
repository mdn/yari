import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { BrowserCompatibilityErrorBoundary } from "./error-boundary";

function renderWithRouter(component) {
  return render(<MemoryRouter>{component}</MemoryRouter>);
}

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
it("renders without crashing", () => {
  const { container } = renderWithRouter(
    <BrowserCompatibilityErrorBoundary>
      <div />
    </BrowserCompatibilityErrorBoundary>
  );
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
  expect(container).toBeDefined();
});

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
it("renders crashing mock component", () => {
  function CrashingComponent() {
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
  }

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
  const consoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  const { container } = renderWithRouter(
    <BrowserCompatibilityErrorBoundary>
      <CrashingComponent />
    </BrowserCompatibilityErrorBoundary>
  );
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
  expect(container.querySelector(".bc-table-error-boundary")).toBeNull();
  const div = container.querySelector("div");
  div && fireEvent.click(div);

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
  expect(consoleError).toHaveBeenCalledWith(
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect.stringMatching("The above error occurred")
  );

  // TODO: When `BrowserCompatibilityErrorBoundary` reports to Sentry, spy on the report function so that we can assert the error stack
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
  expect(container.querySelector(".bc-table-error-boundary")).toBeDefined();
});
