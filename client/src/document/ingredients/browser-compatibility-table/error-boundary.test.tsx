// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '@testing-library/react'. Did y... Remove this comment to see the full error message
import { render, fireEvent } from "@testing-library/react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { MemoryRouter } from "react-router-dom";

import { BrowserCompatibilityErrorBoundary } from "./error-boundary";

function renderWithRouter(component) {
  return render(<MemoryRouter>{component}</MemoryRouter>);
}

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
it("renders without crashing", () => {
  const { container } = renderWithRouter(
    // @ts-expect-error ts-migrate(2786) FIXME: 'BrowserCompatibilityErrorBoundary' cannot be used... Remove this comment to see the full error message
    <BrowserCompatibilityErrorBoundary>
      <div />
    </BrowserCompatibilityErrorBoundary>
  );
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
    // @ts-expect-error ts-migrate(2786) FIXME: 'BrowserCompatibilityErrorBoundary' cannot be used... Remove this comment to see the full error message
    <BrowserCompatibilityErrorBoundary>
      <CrashingComponent />
    </BrowserCompatibilityErrorBoundary>
  );
  expect(container.querySelector(".bc-table-error-boundary")).toBeNull();
  const div = container.querySelector("div");
  div && fireEvent.click(div);

  expect(consoleError).toHaveBeenCalledWith(
    expect.stringMatching("The above error occurred")
  );

  // TODO: When `BrowserCompatibilityErrorBoundary` reports to Sentry, spy on the report function so that we can assert the error stack
  expect(container.querySelector(".bc-table-error-boundary")).toBeDefined();
});
