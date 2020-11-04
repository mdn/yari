import React from "react";
import { Route, Routes, MemoryRouter } from "react-router-dom";
import { Document } from "./index";

const { render, waitFor } = require("@testing-library/react");

declare var global: Window;

const sampleDocumentState = Object.freeze({
  doc: Object.freeze({
    title: "Sample Page",
    summary: "This is the summary",
    mdn_url: "/en-US/docs/Sample/Page",
    sidebarHTML: "<ul><li>One</li></ul>",
    body: [
      {
        type: "prose",
        value: {
          content: "<p>Hello World!</p>",
        },
      },
    ],
    popularity: 0.01,
    modified: "2019-10-10T16:39:07.157Z",
    source: {
      folder: "en-us/sample/page",
      github_url: "http://github.com/mdn/yari/yada/yada",
    },
  }),
});

describe("test viewing a simple document", () => {
  test("render document with props should not crash", async () => {
    const xhrSpy = jest.spyOn(global, "fetch");

    const { getByText } = render(
      <MemoryRouter initialEntries={["/en-US/docs/Sample/Page"]}>
        <Routes>
          <Route
            path="/:locale/docs/*"
            element={
              <Document doc={Object.assign({}, sampleDocumentState.doc)} />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(xhrSpy).not.toHaveBeenCalled();
    await waitFor(() => getByText(/Hello World!/));
    await waitFor(() => getByText(/Sample Page/));
  });

  test("render document without props should not crash", async () => {
    // Mock Fetch API
    const xhrSpy = jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve(Object.assign({}, sampleDocumentState)),
      } as Response)
    );
    const { getByText } = render(
      <MemoryRouter initialEntries={["/en-US/docs/Sample/Page"]}>
        <Routes>
          <Route path="/:locale/docs/*" element={<Document />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => getByText(/Hello World!/));
    await waitFor(() => getByText(/Sample Page/));
    expect(xhrSpy).toHaveBeenCalledTimes(1);
  });
});
