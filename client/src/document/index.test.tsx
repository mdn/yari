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
          id: null,
          content: "<p>Hello World!</p>",
        },
      },
      {
        type: "prose",
        value: {
          id: "lorem_ipsum",
          content:
            "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>",
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

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("test viewing a simple document", () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test("render document with props should not crash", async () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const xhrSpy = jest.spyOn(global, "fetch");

    const { getByText, getAllByText } = render(
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xhrSpy).not.toHaveBeenCalled();
    await waitFor(() => getByText(/Hello World!/));
    await waitFor(() => getAllByText(/Sample Page/));
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test("render document without props should not crash", async () => {
    // Mock Fetch API
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
    const xhrSpy = jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve(Object.assign({}, sampleDocumentState)),
      } as Response)
    );
    const { getByText, getAllByText } = render(
      <MemoryRouter initialEntries={["/en-US/docs/Sample/Page"]}>
        <Routes>
          <Route path="/:locale/docs/*" element={<Document />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => getByText(/Hello World!/));
    await waitFor(() => getAllByText(/Sample Page/));
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(xhrSpy).toHaveBeenCalledTimes(1);
  });
});
