import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { SearchWidget } from "./search";

it("renders without crashing", () => {
  const { getByPlaceholderText } = render(<SearchWidget />);
  expect(getByPlaceholderText(/Site search/)).toBeDefined();
});

describe("Tests using XHR", () => {
  beforeEach(() => {
    // Mock Fetch API
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: () =>
          Promise.resolve({
            titles: {
              "/docs/Web/HTML/Element/abbr": {
                title: "<abbr>: The Abbreviation element",
                popularity: 0.0,
              },
            },
          }),
      })
    );
    global.fetch.mockClear();
  });

  test("input placeholder changes when focused", async () => {
    const { getByPlaceholderText } = render(<SearchWidget />);
    const input = getByPlaceholderText(/Site search/);
    fireEvent.focus(input);
    expect(getByPlaceholderText(/Initializing/));
    await waitFor(() => getByPlaceholderText(/Go ahead/));
  });

  test("XHR request on focusing input the first time", () => {
    const { getByPlaceholderText } = render(<SearchWidget />);
    const input = getByPlaceholderText(/Site search/);
    // Fire initial focus event
    fireEvent.focus(input);
    // Expect XHR
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // Clear the mock fetch
    global.fetch.mockClear();
    // Fire focus event again to ensure it's not called again
    fireEvent.focus(input);
    expect(global.fetch).toHaveBeenCalledTimes(0);
  });

  test("should set titles in localStorage", async () => {
    const { getByPlaceholderText } = render(<SearchWidget />);
    const input = getByPlaceholderText(/Site search/);
    // Focus input to get titles from XHR
    fireEvent.focus(input);
    expect(global.localStorage.getItem("titles")).toBeDefined();
  });

  test("should NOT get search results", async () => {
    const { getByPlaceholderText, getByText } = render(<SearchWidget />);
    const input = getByPlaceholderText(/Site search/);
    // Focus input to get titles from XHR
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "div" } });
    // Get the search results
    await waitFor(() => getByText("nothing found"));
  });

  test("should get search results", async () => {
    const { getByPlaceholderText, getByText } = render(<SearchWidget />);
    const input = getByPlaceholderText(/Site search/);
    // Focus input to get titles from XHR
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "ABb" } });
    // Get the search results
    // But can't use getByText on title because it's peppered with
    // <mark> tags. But the small test with the path should be findable.
    await waitFor(() => getByText(/Web \/ HTML \/ Element \/ abbr/));
  });

  test("should get search results by URI", async () => {
    const { getByText, getByPlaceholderText } = render(<SearchWidget />);
    const input = getByPlaceholderText(/Site search/);
    // Focus input to get titles from XHR
    fireEvent.focus(input);
    fireEvent.change(input, {
      target: { value: "/dwm/mtabr" },
    });
    // Get the search results
    await waitFor(() => getByText(/Fuzzy searching by URI/));
  });

  test("should redirect when clicking a search result", async (done) => {
    // Define onPushState function to listen for redirect
    const onPushState = (event) => {
      expect(event.detail.url).toBe("/docs/Web/HTML/Element/abbr");
      window.removeEventListener("pushState", onPushState);
      done();
    };
    window.addEventListener("pushState", onPushState);
    const { getByText, getByPlaceholderText } = render(
      <SearchWidget pathname="/" />
    );
    const input = getByPlaceholderText(/Site search/);
    // Focus input to get titles from XHR
    fireEvent.focus(input);
    fireEvent.change(input, {
      target: { value: "/docs/Web/HTML/Element/abbr" },
    });
    // Get the search results
    const targetResult = await waitFor(() =>
      getByText(/The Abbreviation element/)
    );
    // Click the highlit result
    fireEvent.click(targetResult);
  });
});
