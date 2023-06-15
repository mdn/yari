import { test, expect } from "@playwright/test";

export {};

function testURL(pathname = "/") {
  const PORT = parseInt(process.env.SERVER_PORT || "5042");
  return `http://localhost:${PORT}${pathname}`;
}

function liveSampleURL(uri: string, id: string, legacy = false) {
  const params = new URLSearchParams([
    ["id", id],
    ["url", uri],
  ]);
  return `${uri}/${
    legacy ? `_sample_.${id}` : "unsafe-runner"
  }.html?${params.toString()}`;
}

test.describe("Basic viewing of functional pages", () => {
  test("open the /en-US/docs/Web/Foo page", async ({ page }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    expect(await page.title()).toContain("<foo>: A test tag");
    expect(await page.innerText("h1")).toBe("<foo>: A test tag");
    expect(await page.isVisible(".metadata time")).toBeTruthy();
  });

  // @TODO Temporarily disabled until we reintroduce the language selector
  // test("open the French /fr/docs/Web/Foo page and navigate to English", async ({
  //   page,
  // }) => {
  //   await page.goto(testURL("/fr/docs/Web/Foo"));
  //   expect(await page.innerText("h1")).toBe("<foo>: Une page de test");
  //   await page.click("text=View in English");
  //   expect(await page.innerText("h1")).toBe("<foo>: A test tag");
  //   // Should have been redirected too...
  //   expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo/"));
  // });

  test("open the /en-US/docs/Web/InteractiveExample page", async ({ page }) => {
    await page.goto(testURL("/en-US/docs/Web/InteractiveExample"));
    expect(
      await page.isVisible("text=I Have an Interactive Example")
    ).toBeTruthy();
  });

  test("open the /en-US/docs/Learn/CSS/CSS_layout/Introduction page", async ({
    page,
  }) => {
    const uri = "/en-US/docs/Learn/CSS/CSS_layout/Introduction";
    const flexSample1Uri = liveSampleURL(`${uri}/Flex`, "flex_1", true);
    const flexSample2Uri = liveSampleURL(`${uri}/Flex`, "flex_2", true);
    const gridSample1Uri = liveSampleURL(`${uri}/Grid`, "grid_1", true);
    const gridSample2Uri = liveSampleURL(uri, "grid_2");
    await page.goto(testURL(uri));
    expect(await page.title()).toContain("A Test Introduction to CSS layout");
    expect(await page.innerText("h1")).toBe(
      "A Test Introduction to CSS layout"
    );
    expect(await page.innerText("#flexbox")).toBe("Flexbox");
    expect(
      await page.isVisible(`iframe.sample-code-frame[src$="${flexSample1Uri}"]`)
    ).toBeTruthy();
    expect(
      await page.isVisible(`iframe.sample-code-frame[src$="${flexSample2Uri}"]`)
    ).toBeTruthy();
    expect(await page.innerText("#grid_layout")).toBe("Grid Layout");
    expect(
      await page.isVisible(`iframe.sample-code-frame[src$="${gridSample1Uri}"]`)
    ).toBeTruthy();
    expect(await page.innerText("#grid_2 pre.css.notranslate")).toMatch(
      /\.wrapper\s*\{\s*display:\s*grid;/
    );
    expect(
      await page.isVisible(`iframe.sample-code-frame[src$="${gridSample2Uri}"]`)
    ).toBeTruthy();

    // Ensure that the live-sample pages were built.
    for (const sampleUri of [
      flexSample1Uri,
      flexSample2Uri,
      gridSample1Uri,
      gridSample2Uri,
    ]) {
      await page.goto(testURL(sampleUri));
      expect(await page.innerText("body > div.wrapper > div.box1")).toBe("One");
      expect(await page.innerText("body > div.wrapper > div.box2")).toBe("Two");
      expect(await page.innerText("body > div.wrapper > div.box3")).toBe(
        "Three"
      );
    }
  });

  test("open the /en-US/docs/Learn/CSS/CSS_layout/Introduction/Flex page", async ({
    page,
  }) => {
    const uri = "/en-US/docs/Learn/CSS/CSS_layout/Introduction/Flex";
    const flexSample1Uri = liveSampleURL(uri, "flex_1");
    const flexSample2Uri = liveSampleURL(uri, "flex_2");
    await page.goto(testURL(uri));
    expect(await page.title()).toContain(
      "A Test Introduction to CSS Flexbox Layout"
    );
    expect(await page.innerText("h1")).toBe(
      "A Test Introduction to CSS Flexbox Layout"
    );
    expect(await page.innerText("#flexbox")).toBe("Flexbox");

    expect(await page.innerText("#flex_1 pre.css.notranslate")).toMatch(
      /\.wrapper\s*\{\s*display:\s*flex;\s*\}/
    );
    expect(
      await page.isVisible(`iframe.sample-code-frame[src$="${flexSample1Uri}"]`)
    ).toBeTruthy();

    expect(await page.innerText("#flex_2 pre.css.notranslate")).toMatch(
      /\.wrapper {\s*display: flex;\s*\}\s*\.wrapper > div \{\s*flex: 1;\s*\}/
    );
    expect(
      await page.isVisible(`iframe.sample-code-frame[src$="${flexSample2Uri}"]`)
    ).toBeTruthy();
  });

  test("open the /en-US/docs/Learn/CSS/CSS_layout/Introduction/Grid page", async ({
    page,
  }) => {
    const uri = "/en-US/docs/Learn/CSS/CSS_layout/Introduction/Grid";
    const gridSample1Uri = liveSampleURL(uri, "grid_1");
    const gridSample2Uri = liveSampleURL(uri, "grid_2");
    await page.goto(testURL(uri));
    expect(await page.title()).toContain(
      "A Test Introduction to CSS Grid Layout"
    );
    expect(await page.innerText("h1")).toBe(
      "A Test Introduction to CSS Grid Layout"
    );
    expect(await page.innerText("#grid_layout")).toBe("Grid Layout");
    expect(await page.innerText("#grid_1 pre.css.notranslate")).toMatch(
      /\.wrapper\s*\{\s*display:\s*grid;/
    );
    expect(
      await page.isVisible(`iframe.sample-code-frame[src$="${gridSample1Uri}"]`)
    ).toBeTruthy();

    expect(await page.innerText("#grid_2 pre.css.notranslate")).toMatch(
      /grid-template-columns: 1fr 1fr 1fr;/
    );
    expect(
      await page.isVisible(`iframe.sample-code-frame[src$="${gridSample2Uri}"]`)
    ).toBeTruthy();

    // Ensure that the live-sample page "gridSample2Uri" was built.
    await page.goto(testURL(gridSample2Uri));
    expect(await page.innerText("body > div.wrapper > div.box1")).toBe("One");
    expect(await page.innerText("body > div.wrapper > div.box2")).toBe("Two");
    expect(await page.innerText("body > div.wrapper > div.box3")).toBe("Three");
  });

  test("return to previous page on back-button press", async ({ page }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    expect(await page.title()).toContain("<foo>: A test tag");
    expect(await page.innerText("h1")).toBe("<foo>: A test tag");
    // Click the parent page in the breadcrumbs
    await page.click(".breadcrumbs-container a");
    expect(await page.innerText("h1")).toBe("Web technology for developers");
    expect(page.url()).toBe(testURL("/en-US/docs/Web"));
    await page.goBack();
    expect(await page.innerText("h1")).toBe("<foo>: A test tag");
  });

  test("have a semantically valid breadcrumb trail", async ({ page }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    // Let's not get too technical about the name of the selectors and
    // stuff but do note that the page you're on is always a valid link
    expect(
      await page.innerText(
        "nav a.breadcrumb-current-page[property=item][typeof=WebPage]"
      )
    ).toBe(
      // Always includes a link to "self"
      "<foo>"
    );
  });

  test("say which page was not found", async ({ page }) => {
    await page.goto(testURL("/en-US/docs/Doesnot/exist"));
    expect(await page.isVisible("text=Page not found")).toBeTruthy();
    expect(await page.isVisible("text=could not be found")).toBeTruthy();
  });

  test("suggest the en-US equivalent on non-en-US pages not found", async ({
    page,
  }) => {
    await page.goto(testURL("/ja/docs/Web/foo"));
    expect(await page.isVisible("text=Page not found")).toBeTruthy();
    expect(await page.isVisible("text=could not be found")).toBeTruthy();
    // Wait for XHR loading of the whole document
    await page.waitForLoadState("networkidle");
    // Simply by swapping the "ja" for "en-US" it's able to find the index.json
    // for that slug and present a link to it.
    expect(await page.isVisible("text=Good news!")).toBeTruthy();
    expect(await page.getAttribute(".fallback-link a", "href")).toBe(
      "/en-US/docs/Web/Foo"
    );
  });
});

/*
test.describe("changing language", () => {
  test("from French to English, set a cookie, and back again", async ({
    page,
  }) => {
    await page.goto(testURL("/fr/docs/Web/Foo"));
    expect(await page.isVisible("text=<foo>: Une page de test")).toBeTruthy();
    await page.selectOption('select[name="language"]', {
      label: "English (US)",
    });

    await page.click('button:has-text("Change language")');
    // Wait for XHR loading of the whole document
    await page.waitForLoadState("networkidle");
    expect(await page.isVisible("text=<foo>: A test tag")).toBeTruthy();
    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo/"));

    // And change back to French
    await page.selectOption('select[name="language"]', {
      label: "Français",
    });
    await page.click('button:has-text("Change language")');
    // Wait for XHR loading of the whole document
    await page.waitForLoadState("networkidle");
    expect(await page.isVisible("text=<foo>: Une page de test")).toBeTruthy();
    expect(page.url()).toBe(testURL("/fr/docs/Web/Foo/"));
  });
});
*/

test.describe("viewing retired locales", () => {
  test("redirect retired locale to English (document)", async ({ page }) => {
    await page.goto(testURL("/ar/docs/Web/Foo"));
    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo/?retiredLocale=ar"));
    expect(await page.innerText("h1")).toBe("<foo>: A test tag");
  });

  test("redirect retired locale to English (index.json)", async ({ page }) => {
    await page.goto(testURL("/ar/docs/Web/Foo/index.json"));
    expect(page.url()).toBe(
      testURL("/en-US/docs/Web/Foo/index.json?retiredLocale=ar")
    );
    expect(await page.isVisible("text=<foo>: A test tag")).toBeTruthy();
  });

  test("redirect retired locale to English (search with query string)", async ({
    page,
  }) => {
    await page.goto(testURL("/ar/search?q=video"));
    expect(page.url()).toBe(testURL("/en-US/search/?q=video&retiredLocale=ar"));
    expect(await page.isVisible("text=Search results for: video")).toBeTruthy();
  });

  test("say the locale was retired", async ({ page }) => {
    await page.goto(testURL("/en-US/docs/Web/Foo/?retiredLocale=ar"));
    expect(
      await page.isVisible("text=The page you requested has been retired")
    ).toBeTruthy();
    // sanity check that it goes away
    await page.goto(testURL("/en-US/docs/Web/Foo/"));
    expect(
      await page.isVisible("text=The page you requested has been retired")
    ).toBeFalsy();
  });

  test("not say the locale was retired if viewing a translated page", async ({
    page,
  }) => {
    await page.goto(testURL("/fr/docs/Web/Foo/?retiredLocale=sv-SE"));
    expect(
      await page.isVisible("text=The page you requested has been retired")
    ).toBeFalsy();
  });
});
