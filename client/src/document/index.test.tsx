import { Document } from "./index";
import { Route, Routes, MemoryRouter } from "react-router-dom";
import React from "react";
const { render, waitFor } = require("@testing-library/react");

declare var global: Window;

const sampleDocumentState = Object.freeze({
  doc: Object.freeze({
    title: "Sample Page",
    locale: "en-US",
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
      last_commit_url:
        "https://github.com/mdn/yari/commit/0102030405060708091011121314151617181920",
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
