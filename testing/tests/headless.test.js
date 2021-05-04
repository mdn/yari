const { setDefaultOptions } = require("expect-puppeteer");

// The default it 500ms. It has happened and it can happen again, that sometimes
// it just takes a little longer than 500ms. Give it a healthy margin of a
// timeout so as to reduce the risk of it failing when there's nothing wrong.
setDefaultOptions({ timeout: 1500 });

function testURL(pathname = "/") {
  return `http://localhost:5000${pathname}`;
}

describe("Basic viewing of functional pages", () => {
  it("open the temporary home page", async () => {
    await page.goto(testURL("/"));
    await expect(page).toMatch("MDN Web Docs");
    await expect(page).toMatchElement("title", { text: /MDN Web Docs/ });
  });

  it("open the /en-US/docs/Web/Foo page", async () => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    await expect(page).toMatch("<foo>: A test tag");
    await expect(page).toMatchElement(".metadata time", {
      visible: true,
    });
  });

  it("open the French /fr/docs/Web/Foo page and navigate to English", async () => {
    await page.goto(testURL("/fr/docs/Web/Foo"));
    await expect(page).toMatchElement("h1", {
      text: "<foo>: Une page de test",
    });
    await expect(page).toClick("a.view-in-english", {
      text: "View in English",
    });
    await expect(page).toMatchElement("h1", { text: "<foo>: A test tag" });
    // Should have been redirected too...
    // Note! It's important that this happens *after* the `.toMatchElement`
    // on the line above because expect-puppeteer doesn't have a wait to
    // properly wait for the (pushState) URL to have changed.
    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo/"));
  });

  it("open the /en-US/docs/Web/InteractiveExample page", async () => {
    await page.goto(testURL("/en-US/docs/Web/InteractiveExample"), {
      // Be a bit less patient with this particular page because it contains
      // an iframe, on an external URL,  which we're not particularly
      // interested in waiting for.
      waitUntil: "domcontentloaded",
    });
    await expect(page).toMatch("I Have an Interactive Example");
  });

  it("open the /en-US/docs/Learn/CSS/CSS_layout/Introduction page", async () => {
    const uri = "/en-US/docs/Learn/CSS/CSS_layout/Introduction";
    const flexSample1Uri = `${uri}/Flex/_samples_/Flex_1`;
    const flexSample2Uri = `${uri}/Flex/_samples_/Flex_2`;
    const gridSample1Uri = `${uri}/Grid/_samples_/Grid_1`;
    const gridSample2Uri = `${uri}/_samples_/Grid_2`;
    await page.goto(testURL(uri));
    await expect(page).toMatch("A Test Introduction to CSS layout");
    await expect(page).toMatchElement("h1", {
      text: "A Test Introduction to CSS layout",
    });
    await expect(page).toMatchElement("#flexbox", {
      text: "Flexbox",
    });
    await expect(page).toMatchElement(
      `iframe.sample-code-frame[src$="${flexSample1Uri}"]`
    );
    await expect(page).toMatchElement(
      `iframe.sample-code-frame[src$="${flexSample2Uri}"]`
    );
    await expect(page).toMatchElement("#grid_layout", {
      text: "Grid Layout",
    });
    await expect(page).toMatchElement(
      `iframe.sample-code-frame[src$="${gridSample1Uri}"]`
    );
    await expect(page).toMatchElement("#Grid_2 > pre.css.notranslate", {
      text: /\.wrapper\s*\{\s*display:\s*grid;/,
    });
    await expect(page).toMatchElement(
      `iframe.sample-code-frame[src$="${gridSample2Uri}"]`
    );
    // Ensure that the live-sample pages were built.
    for (const sampleUri of [
      flexSample1Uri,
      flexSample2Uri,
      gridSample1Uri,
      gridSample2Uri,
    ]) {
      await page.goto(testURL(sampleUri));
      await expect(page).toMatchElement("body > div.wrapper > div.box1", {
        text: "One",
      });
      await expect(page).toMatchElement("body > div.wrapper > div.box2", {
        text: "Two",
      });
      await expect(page).toMatchElement("body > div.wrapper > div.box3", {
        text: "Three",
      });
    }
  });

  it("open the /en-US/docs/Learn/CSS/CSS_layout/Introduction/Flex page", async () => {
    const uri = "/en-US/docs/Learn/CSS/CSS_layout/Introduction/Flex";
    const flexSample1Uri = `${uri}/_samples_/Flex_1`;
    const flexSample2Uri = `${uri}/_samples_/Flex_2`;
    await page.goto(testURL(uri));
    await expect(page).toMatch("A Test Introduction to CSS Flexbox Layout");
    await expect(page).toMatchElement("h1", {
      text: "A Test Introduction to CSS Flexbox Layout",
    });
    await expect(page).toMatchElement("#flexbox", {
      text: "Flexbox",
    });
    await expect(page).toMatchElement("#Flex_1 > pre.css.notranslate", {
      text: /\.wrapper\s*\{\s*display:\s*flex;\s*\}/,
    });
    await expect(page).toMatchElement(
      `iframe.sample-code-frame[src$="${flexSample1Uri}"]`
    );
    await expect(page).toMatchElement("#Flex_2 > pre.css.notranslate", {
      text: /\.wrapper\s*\{\s*display:\s*flex;\s*\}.+flex:\s*1;/,
    });
    await expect(page).toMatchElement(
      `iframe.sample-code-frame[src$="${flexSample2Uri}"]`
    );
  });

  it("open the /en-US/docs/Learn/CSS/CSS_layout/Introduction/Grid page", async () => {
    const uri = "/en-US/docs/Learn/CSS/CSS_layout/Introduction/Grid";
    const gridSample1Uri = `${uri}/_samples_/Grid_1`;
    const gridSample2Uri = `${uri}/_samples_/Grid_2`;
    await page.goto(testURL(uri));
    await expect(page).toMatch("A Test Introduction to CSS Grid Layout");
    await expect(page).toMatchElement("h1", {
      text: "A Test Introduction to CSS Grid Layout",
    });
    await expect(page).toMatchElement("#grid_layout", {
      text: "Grid Layout",
    });
    await expect(page).toMatchElement("#Grid_1 > pre.css.notranslate", {
      text: /\.wrapper\s*\{\s*display:\s*grid;/,
    });
    await expect(page).toMatchElement(
      `iframe.sample-code-frame[src$="${gridSample1Uri}"]`
    );
    await expect(page).toMatchElement("#Grid_2 > pre.css.notranslate", {
      text: /\.wrapper\s*\{\s*display:\s*grid;.+\.box1\s*\{/,
    });
    await expect(page).toMatchElement(
      `iframe.sample-code-frame[src$="${gridSample2Uri}"]`
    );
    // Ensure that the live-sample page "gridSample2Uri" was built.
    await page.goto(testURL(gridSample2Uri));
    await expect(page).toMatchElement("body > div.wrapper > div.box1", {
      text: "One",
    });
    await expect(page).toMatchElement("body > div.wrapper > div.box2", {
      text: "Two",
    });
    await expect(page).toMatchElement("body > div.wrapper > div.box3", {
      text: "Three",
    });
  });

  it("should return to previous page on back-button press", async () => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    await expect(page).toMatch("<foo>: A test tag");
    await expect(page).toMatchElement("h1", {
      text: "<foo>: A test tag",
    });
    // Click the parent page in the breadcrumbs
    // BUT due to some bug somewhere, you can't do
    //
    //    await expect(page).toClick("nav.breadcrumbs a")
    //
    // ...because you keep getting:
    //
    //   "Node is either not visible or not an HTMLElement"
    //
    // So, because of that, let's just do it "the pure puppeteer way."
    //
    // For more information, see
    // https://github.com/puppeteer/puppeteer/issues/2977#issuecomment-412807613
    await page.evaluate(() => {
      document.querySelector(".breadcrumbs-container a").click();
    });
    await expect(page).toMatchElement("h1", {
      text: "Web technology for developers",
    });
    expect(page.url()).toBe(testURL("/en-US/docs/Web"));
    await page.goBack();
    await expect(page).toMatchElement("h1", {
      text: "<foo>: A test tag",
    });
  });

  it("should have a semantically valid breadcrumb trail", async () => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    // Let's not get too technical about the name of the selectors and
    // stuff but do note that the page you're on is always a valid link
    await expect(page).toMatchElement("nav a[property=item][typeof=WebPage]", {
      // Always includes a link to "self"
      text: "<foo>: A test tag",
    });
    await expect(page).toMatchElement("nav a[property=item][typeof=WebPage]", {
      // You gotta know your fixture documents
      text: "Web technology for developers",
    });
  });

  it("should say which page was not found", async () => {
    await page.goto(testURL("/en-US/docs/Doesnot/exist"));
    await expect(page).toMatch("Page not found");
    await expect(page).toMatch("/en-US/docs/Doesnot/exist could not be found");
  });

  it("should suggest the en-US equivalent on non-en-US pages not found", async () => {
    await page.goto(testURL("/ja/docs/Web/foo"));
    await expect(page).toMatch("Page not found");
    await expect(page).toMatch("/ja/docs/Web/foo could not be found");
    // Simply by swapping the "ja" for "en-US" it's able to find the index.json
    // for that slug and present a link to it.
    await expect(page).toMatch("Good news!");
    await expect(page).toMatchElement("a", {
      text: "<foo>: A test tag",
      href: "/en-US/docs/Web/Foo",
    });
  });

  it("should give the home page and see Hacks blog posts", async () => {
    await page.goto(testURL("/en-US/"));
    await expect(page).toMatch("Resources for developers, by developers.");
    await expect(page).toMatch("Hacks Blog");

    // One home page for every built locale
    await page.goto(testURL("/fr/"));
    await expect(page).toMatch("Resources for developers, by developers.");
  });

  it("should be able to switch from French to English, set a cookie, and back again", async () => {
    await page.goto(testURL("/fr/docs/Web/Foo"));
    await expect(page).toMatch("<foo>: Une page de test");
    await expect(page).toSelect('select[name="language"]', "English (US)");
    await expect(page).toClick("button", { text: "Change language" });
    await expect(page).toMatch("<foo>: A test tag");
    expect(page.url()).toBe(testURL("/en-US/docs/Web/Foo/"));

    // And change back to French
    await expect(page).toSelect('select[name="language"]', "Français");
    await expect(page).toClick("button", { text: "Change language" });
    await expect(page).toMatch("<foo>: Une page de test");
    expect(page.url()).toBe(testURL("/fr/docs/Web/Foo/"));
  });

  it("clicking 'Sign in' should offer links to all identity providers", async () => {
    await page.goto(testURL("/en-US/docs/Web/Foo"));
    await expect(page).toClick("a", { text: "Sign in" });
    await expect(page).toMatchElement("h1", { text: "Sign in" });
    expect(page.url()).toContain(
      testURL(
        `/en-US/signin?${new URLSearchParams(
          "next=/en-US/docs/Web/Foo"
        ).toString()}`
      )
    );
    await expect(page).toMatchElement("a", { text: "Google" });
    await expect(page).toMatchElement("a", { text: "GitHub" });
  });

  it("going to 'Sign up' page without query string", async () => {
    await page.goto(testURL("/en-US/signup"));
    await expect(page).toMatchElement("h1", {
      text: "Sign in to MDN Web Docs",
    });
    await expect(page).toMatch("Invalid URL");
    await expect(page).toMatchElement("a", {
      text: "Please retry the sign-in process",
    });
  });

  it("going to 'Sign up' page with realistic (fake) query string", async () => {
    const sp = new URLSearchParams();
    sp.set("csrfmiddlewaretoken", "abc");
    sp.set("provider", "github");
    sp.set(
      "user_details",
      JSON.stringify({
        name: "Peter B",
      })
    );

    await page.goto(testURL(`/en-US/signup?${sp.toString()}`));
    await expect(page).toMatchElement("h1", {
      text: "Sign in to MDN Web Docs",
    });
    await expect(page).not.toMatch("Invalid URL");
    await expect(page).toMatch(
      "You are signing in to MDN Web Docs with GitHub as Peter B."
    );
    await expect(page).toMatch(
      "I agree to Mozilla's Terms and Privacy Notice."
    );
    await expect(page).toMatchElement("button", { text: "Complete sign-in" });
  });

  it("should say you're not signed in on the settings page", async () => {
    await page.goto(testURL("/en-US/settings"));
    await expect(page).toMatchElement("h1", { text: "Account settings" });
    await expect(page).toMatchElement("a", {
      text: "Please sign in to continue",
    });
  });

  it("should show your settings page", async () => {
    const url = testURL("/en-US/settings");
    // A `fakesessionid` is a special trick to tell the static server we use
    // for mocking the `/api/v1`.
    await page.setCookie({
      name: "fakesessionid",
      value: "peterbe",
      domain: new URL(url).host,
    });

    await page.goto(url);
    await expect(page).toMatchElement("h1", { text: "Account settings" });
    await expect(page).toMatchElement("button", { text: "Close account" });

    // Change locale to French
    await expect(page).toSelect('select[name="locale"]', "French");
    await expect(page).toClick("button", { text: "Update language" });
    await expect(page).toMatch("Yay! Updated settings successfully saved.");
  });
});
