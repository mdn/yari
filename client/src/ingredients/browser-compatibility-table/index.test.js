import React from "react";
import { render, waitForElement } from "@testing-library/react";
import { FetchMock } from "@react-mock/fetch";
import { BrowserCompatibilityTable } from "./index.js";

it("renders ok", async () => {
  const fakeData = {
    uri: "bcd.json",
    title: "Browser Compatibility",
    id: "bcd"
  };
  const { container, getByText } = render(
    <FetchMock
      options={{
        matcher: "/bcd.json",
        response: {
          title: "Browser compatibility",
          id: "browser_compatibility",
          query: "html.elements.video",
          data: {
            __compat: {
              mdn_url: "Web/HTML/Element/video",
              support: {}
            }
          }
        },
        method: "GET"
      }}
    >
      <BrowserCompatibilityTable data={fakeData} />
    </FetchMock>
  );
  expect(getByText("Loading browser compatibility table..."));
  await waitForElement(() => container.querySelector(".bc-table"));
  expect(container.querySelector(".bc-table-error-boundary")).toBeNull();
});

it("renders fetch error on fetch problems", async () => {
  const fakeData = {
    uri: "bcd.json",
    title: "Browser Compatibility",
    id: "bcd"
  };
  const { container, getByText } = render(
    <FetchMock
      options={{
        matcher: "/bcd.json",
        response: 404, // Not ok!
        method: "GET"
      }}
    >
      <BrowserCompatibilityTable data={fakeData} />
    </FetchMock>
  );
  expect(getByText("Loading browser compatibility table..."));
  await waitForElement(() => container.querySelector(".bcd-fetch-error"));
  expect(container.querySelector(".bc-table")).toBeNull();
});

it("renders error boundary when no data is present", async () => {
  // The ErrorBoundary component deliberately uses console.error(). Let's
  // silence that during this test so it won't spook us.
  const originalError = console.error;
  console.error = jest.fn();

  const fakeData = {
    uri: "bcd.json",
    title: "Browser Compatibility",
    id: "bcd"
  };
  const { container, getByText } = render(
    <FetchMock
      options={{
        matcher: "/bcd.json",
        response: {
          title: "Browser compatibility",
          id: "browser_compatibility",
          query: "html.elements.video"
          // NOTE! The 'data' key is missing and will cause an error to be thrown
        },
        method: "GET"
      }}
    >
      <BrowserCompatibilityTable data={fakeData} />
    </FetchMock>
  );
  expect(getByText("Loading browser compatibility table..."));
  await waitForElement(() =>
    container.querySelector(".bc-table-error-boundary")
  );
  expect(container.querySelector(".bc-table")).toBeNull();
  expect(container.querySelector(".bc-table-error-boundary")).toBeDefined();
  console.error = originalError;
  // TODO: When `BrowserCompatibilityErrorBoundary` reports to Sentry, spy on the report function so that we can assert the error stack
});
