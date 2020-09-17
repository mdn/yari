/**
 * @prettier
 */
const {
  assert,
  itMacro,
  describeMacro,
  beforeEachMacro,
  lintHTML,
} = require("./utils");

const fs = require("fs"),
  path = require("path"),
  jsdom = require("jsdom"),
  extend = require("extend"),
  fixture_dir = path.resolve(__dirname, "fixtures/compat");

const { JSDOM } = jsdom;

let fixtureCompatData = {};
fs.readdirSync(fixture_dir).forEach(function (fn) {
  fixtureCompatData = extend(
    true,
    fixtureCompatData,
    JSON.parse(fs.readFileSync(path.resolve(fixture_dir, fn), "utf8"))
  );
});

describeMacro("Compat", function () {
  beforeEachMacro(function (macro) {
    macro.ctx.require = jest.fn((pkg) => fixtureCompatData);

    /*        macro.ctx.require = sinon.stub();
        macro.ctx.require.withArgs('@mdn/browser-compat-data').returns(fixtureCompatData);
*/
  });

  itMacro(
    'Outputs a message if there is no data for the query "foo.bar"',
    function (macro) {
      let actual = macro.call("foo.bar");
      let expected =
        '<div class="bc-data" id="bcd:foo.bar">No compatibility data found. ' +
        'Please contribute data for "foo.bar" (depth: 1) to the ' +
        '<a href="https://github.com/mdn/browser-compat-data">MDN compatibility data repository</a>.</div>';
      return assert.eventually.equal(actual, expected);
    }
  );

  itMacro("Outputs valid HTML", async (macro) => {
    const result = await macro.call("api.feature");
    expect(lintHTML(result)).toBeFalsy();
  });

  // Different content areas have different platforms (desktop, mobile, server)
  // which consist of different browsers
  // Tests content_areas.json
  itMacro(
    "Creates correct platform and browser columns for API data",
    function (macro) {
      return macro.call("api.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table").classList),
          "bc-table-web"
        );
        assert.equal(dom.querySelector(".bc-platform-desktop").colSpan, 6);
        assert.equal(dom.querySelector(".bc-platform-mobile").colSpan, 6);
      });
    }
  );
  itMacro(
    "Creates correct platform and browser columns for CSS data",
    function (macro) {
      return macro.call("css.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table").classList),
          "bc-table-web"
        );
        assert.equal(dom.querySelector(".bc-platform-desktop").colSpan, 6);
        assert.equal(dom.querySelector(".bc-platform-mobile").colSpan, 6);
      });
    }
  );
  itMacro(
    "Creates correct platform and browser columns for HTML data",
    function (macro) {
      return macro.call("html.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table").classList),
          "bc-table-web"
        );
        assert.equal(dom.querySelector(".bc-platform-desktop").colSpan, 6);
        assert.equal(dom.querySelector(".bc-platform-mobile").colSpan, 6);
      });
    }
  );
  itMacro(
    "Creates correct platform and browser columns for HTTP data",
    function (macro) {
      return macro.call("http.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table").classList),
          "bc-table-web"
        );
        assert.equal(dom.querySelector(".bc-platform-desktop").colSpan, 6);
        assert.equal(dom.querySelector(".bc-platform-mobile").colSpan, 6);
      });
    }
  );
  itMacro(
    "Creates correct platform and browser columns for JavaScript data",
    function (macro) {
      return macro.call("javascript.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table").classList),
          "bc-table-js"
        );
        assert.equal(dom.querySelector(".bc-platform-desktop").colSpan, 6);
        assert.equal(dom.querySelector(".bc-platform-mobile").colSpan, 6);
        assert.equal(dom.querySelector(".bc-platform-server").colSpan, 1);
      });
    }
  );
  itMacro(
    "Creates correct platform and browser columns for WebExtensions data",
    function (macro) {
      return macro.call("webextensions.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table").classList),
          "bc-table-ext"
        );
        assert.equal(dom.querySelector(".bc-platform-desktop").colSpan, 4);
        assert.equal(dom.querySelector(".bc-platform-mobile").colSpan, 1);
      });
    }
  );

  // Tests feature_labels.json and status icons
  itMacro("Creates correct feature labels for bare features", function (macro) {
    return macro.call("api.bareFeature").then(function (result) {
      let dom = JSDOM.fragment(result);
      assert.equal(
        dom.querySelector(".bc-table tbody tr th").innerHTML,
        "<code>bareFeature</code>"
      );
      assert.equal(
        dom.querySelector(".bc-table tbody tr:nth-child(2) th").innerHTML,
        "<code>bareSubFeature</code>"
      );
    });
  });
  itMacro(
    "Creates correct feature labels for features with descriptions",
    function (macro) {
      return macro.call("api.feature_with_description").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.equal(
          dom.querySelector(".bc-table tbody tr th").innerHTML,
          "Root feature description"
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr:nth-child(2) th").innerHTML,
          "<code>Interface()</code> constructor"
        );
      });
    }
  );
  itMacro(
    "Creates correct feature labels for features with an MDN URL",
    function (macro) {
      macro.ctx.env.slug = "Web/HTTP/Headers/Content-Security-Policy";
      return macro.call("api.feature_with_mdn_url").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.equal(
          dom.querySelector(".bc-table tbody tr th").innerHTML,
          "<code>feature_with_mdn_url</code>"
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr:nth-child(2) th").innerHTML,
          '<a href="/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/child-src"><code>subfeature_with_mdn_url</code></a>'
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr:nth-child(3) th").innerHTML,
          '<a href="#Directives"><code>subfeature_with_same_mdn_url_and_fragment</code></a>'
        );
      });
    }
  );
  itMacro(
    "Creates correct feature labels for features with an MDN URL and a description",
    function (macro) {
      macro.ctx.env.slug = "Web/HTTP/Headers/Content-Security-Policy";
      return macro
        .call("api.feature_with_mdn_url_and_description")
        .then(function (result) {
          let dom = JSDOM.fragment(result);
          assert.equal(
            dom.querySelector(".bc-table tbody tr th").innerHTML,
            "CSP"
          );
          assert.equal(
            dom.querySelector(".bc-table tbody tr:nth-child(2) th").innerHTML,
            '<a href="/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/child-src">CSP: child-src</a>'
          );
          assert.equal(
            dom.querySelector(".bc-table tbody tr:nth-child(3) th").innerHTML,
            '<a href="#Directives">CSP Directives</a>'
          );
        });
    }
  );
  itMacro(
    "Creates correct feature labels for features with an MDN URL (non-'en-US' locale)",
    async (macro) => {
      macro.ctx.env.locale = "ja";
      macro.ctx.env.slug = "Web/HTTP/Headers/Content-Security-Policy";

      let result = await macro.call("api.feature_with_mdn_url");
      let dom = JSDOM.fragment(result);

      assert.equal(
        dom.querySelector(".bc-table tbody tr th").innerHTML,
        "<code>feature_with_mdn_url</code>"
      );
      assert.equal(
        dom.querySelector(".bc-table tbody tr:nth-child(2) th").innerHTML,
        '<a href="/ja/docs/Web/HTTP/Headers/Content-Security-Policy/child-src"><code>subfeature_with_mdn_url</code></a>'
      );
      assert.equal(
        dom.querySelector(".bc-table tbody tr:nth-child(3) th").innerHTML,
        '<a href="#Directives"><code>subfeature_with_same_mdn_url_and_fragment</code></a>'
      );
    }
  );
  itMacro(
    "Creates correct labels for experimental/non-standard features",
    function (macro) {
      return macro.call("api.experimental_feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.equal(
          dom.querySelector(".bc-table tbody tr th").textContent,
          "experimental_feature Experimental"
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr:nth-child(2) th").textContent,
          "experimental_non-standard_sub_feature ExperimentalNon-standard"
        );
      });
    }
  );
  itMacro(
    "Creates correct labels for deprecated features with a description",
    function (macro) {
      return macro
        .call("api.deprecated_feature_with_description")
        .then(function (result) {
          let dom = JSDOM.fragment(result);
          assert.equal(
            dom.querySelector(".bc-table tbody tr th").textContent,
            "deprecated_feature_with_description Deprecated"
          );
          assert.equal(
            dom.querySelector(".bc-table tbody tr:nth-child(2) th").textContent,
            "Deprecated syntax Deprecated"
          );
        });
    }
  );

  // Test different support cells, like yes, no, version, partial support
  // Tests support_variations.json
  itMacro("Creates correct cell content for no support", function (macro) {
    return macro.call("html.no_support").then(function (result) {
      let dom = JSDOM.fragment(result);
      assert.include(
        Array.from(
          dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
        ),
        "bc-supports-no"
      );
      assert.equal(
        dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
          .textContent,
        "No support"
      );
      assert.include(
        dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
        "No"
      );
    });
  });
  itMacro("Creates correct cell content for unknown version support", function (
    macro
  ) {
    return macro.call("html.unknown_version_support").then(function (result) {
      let dom = JSDOM.fragment(result);
      assert.include(
        Array.from(
          dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
        ),
        "bc-supports-yes"
      );
      assert.equal(
        dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
          .textContent,
        "Full support"
      );
      assert.include(
        dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
        "Yes"
      );
    });
  });
  itMacro(
    "Creates correct cell content for support with a known version",
    function (macro) {
      return macro.call("html.versioned_support").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
          ),
          "bc-supports-yes"
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
            .textContent,
          "Full support"
        );
        assert.include(
          dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
          "25"
        );
      });
    }
  );
  itMacro(
    "Creates correct cell content for removed support with known versions",
    function (macro) {
      return macro.call("html.removed_support").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
          ),
          "bc-supports-no"
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
            .textContent,
          "No support"
        );
        assert.include(
          dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
          "25 — 35"
        );
      });
    }
  );
  itMacro(
    "Creates correct cell content for removed support with unknown support start",
    function (macro) {
      return macro
        .call("html.removed_support_unknown_start")
        .then(function (result) {
          let dom = JSDOM.fragment(result);
          assert.include(
            Array.from(
              dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
            ),
            "bc-supports-no"
          );
          assert.equal(
            dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
              .textContent,
            "No support"
          );
          assert.include(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
            "? — 35"
          );
        });
    }
  );
  itMacro(
    "Creates correct cell content for removed support with unknown support end",
    function (macro) {
      return macro
        .call("html.removed_support_unknown_end")
        .then(function (result) {
          let dom = JSDOM.fragment(result);
          assert.include(
            Array.from(
              dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
            ),
            "bc-supports-no"
          );
          assert.equal(
            dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
              .textContent,
            "No support"
          );
          assert.include(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
            "25 — ?"
          );
        });
    }
  );
  itMacro(
    "Creates correct cell content for removed support with unknown support range",
    function (macro) {
      return macro
        .call("html.removed_support_unknown_range")
        .then(function (result) {
          let dom = JSDOM.fragment(result);
          assert.include(
            Array.from(
              dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
            ),
            "bc-supports-no"
          );
          assert.equal(
            dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
              .textContent,
            "No support"
          );
          assert.include(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
            "? — ?"
          );
        });
    }
  );
  itMacro(
    "Creates correct cell content for partial support and known version number",
    function (macro) {
      return macro
        .call("html.partial_versioned_support")
        .then(function (result) {
          let dom = JSDOM.fragment(result);
          assert.include(
            Array.from(
              dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
            ),
            "bc-supports-partial"
          );
          assert.equal(
            dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
              .textContent,
            "Partial support"
          );
          assert.include(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
            "25"
          );
        });
    }
  );
  itMacro(
    "Creates correct cell content for partial support and unknown version number",
    function (macro) {
      return macro
        .call("html.partial_unknown_version_support")
        .then(function (result) {
          let dom = JSDOM.fragment(result);
          assert.include(
            Array.from(
              dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
            ),
            "bc-supports-partial"
          );
          assert.equal(
            dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
              .textContent,
            "Partial support"
          );
          assert.include(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
            " Partial"
          );
        });
    }
  );
  itMacro(
    "Creates correct cell content for partial support and no support",
    function (macro) {
      return macro.call("html.partial_no_support").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
          ),
          "bc-supports-partial"
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
            .textContent,
          "Partial support"
        );
        assert.include(
          dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
          " Partial"
        );
      });
    }
  );
  itMacro(
    "Creates correct cell content for partial support and unknown support",
    function (macro) {
      return macro.call("html.partial_unknown_support").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
          ),
          "bc-supports-partial"
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
            .textContent,
          "Partial support"
        );
        assert.include(
          dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
          " Partial"
        );
      });
    }
  );
  itMacro(
    "Creates correct cell content for partial support and removed support",
    function (macro) {
      return macro.call("html.partial_removed_support").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(
            dom.querySelector(".bc-table tbody tr td:nth-child(4)").classList
          ),
          "bc-supports-no"
        );
        assert.equal(
          dom.querySelector(".bc-table tbody tr td:nth-child(4) abbr span")
            .textContent,
          "No support"
        );
        assert.include(
          dom.querySelector(".bc-table tbody tr td:nth-child(4)").textContent,
          "25 — 35"
        );
      });
    }
  );

  // Test icons in main cells
  itMacro(
    "Adds an icon and a note section if a current main feature has an alternative name",
    function (macro) {
      return macro.call("alternative_name.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table tbody tr td").classList),
          "bc-has-history"
        );
        assert.include(
          Array.from(dom.querySelector(".bc-icons i").classList),
          "ic-altname"
        );
      });
    }
  );
  itMacro(
    "Adds an icon and a note section if a current main feature has notes",
    function (macro) {
      return macro.call("notes.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table tbody tr td").classList),
          "bc-has-history"
        );
        assert.include(
          Array.from(dom.querySelector(".bc-icons i").classList),
          "ic-footnote"
        );
      });
    }
  );
  itMacro(
    "Adds an icon and a note section if a current main feature has a flag",
    function (macro) {
      return macro.call("flags.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table tbody tr td").classList),
          "bc-has-history"
        );
        assert.include(
          Array.from(dom.querySelector(".bc-icons i").classList),
          "ic-disabled"
        );
      });
    }
  );
  itMacro(
    "Adds an icon and a note section if a current main feature has a prefix",
    function (macro) {
      return macro.call("prefixes.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(dom.querySelector(".bc-table tbody tr td").classList),
          "bc-has-history"
        );
        assert.include(
          Array.from(dom.querySelector(".bc-icons i").classList),
          "ic-prefix"
        );
      });
    }
  );
  itMacro(
    "Adds a note icon if the first element in a support array has a note",
    function (macro) {
      return macro.call("notes.feature").then(function (result) {
        let dom = JSDOM.fragment(result);
        assert.include(
          Array.from(
            dom.querySelector(".bc-browser-firefox > .bc-icons > abbr > i")
              .classList
          ),
          "ic-footnote"
        );
      });
    }
  );

  // Test flags
  itMacro("Creates correct notes for flags", function (macro) {
    return macro.call("flags.feature").then(function (result) {
      let dom = JSDOM.fragment(result);
      assert.equal(
        dom.querySelectorAll("section.bc-history dl dd")[0].textContent,
        "Disabled From version 10: this feature is behind the Enable experimental Web Platform features preference. To change preferences in Chrome, visit chrome://flags."
      );
      assert.equal(
        dom.querySelectorAll("section.bc-history dl dd")[1].textContent,
        "Disabled From version 17: this feature is behind the --number-format-to-parts runtime flag."
      );
      assert.equal(
        dom.querySelectorAll("section.bc-history dl dd")[2].textContent,
        ""
      ); // empty for the "version_added: 12" range that has no flag
      assert.equal(
        dom.querySelectorAll("section.bc-history dl dd")[3].textContent,
        "Disabled From version 5: this feature is behind the layout.css.vertical-text.enabled preference (needs to be set to true). To change preferences in Firefox, visit about:config."
      );
      assert.equal(
        dom.querySelectorAll("section.bc-history dl dd")[4].textContent,
        "Disabled From version 45: this feature is behind the foo.enabled preference and the bar.enabled preference."
      );
      assert.equal(
        dom.querySelectorAll("section.bc-history dl dd")[5].textContent,
        "Disabled From version 55 until version 60 (exclusive): this feature is behind the --datetime-format-to-parts compile flag."
      );
    });
  });

  itMacro("Adds correct titles for platforms to head of table", function (
    macro
  ) {
    return macro.call("javascript.feature").then(function (result) {
      let dom = JSDOM.fragment(result);
      assert.equal(
        dom.querySelectorAll(".bc-platforms span")[0].textContent,
        "Desktop"
      );
      assert.equal(
        dom.querySelectorAll(".bc-platforms span")[1].textContent,
        "Mobile"
      );
      assert.equal(
        dom.querySelectorAll(".bc-platforms span")[2].textContent,
        "Server"
      );
    });
  });

  itMacro("Adds correct classes for browsers to head of table", function (
    macro
  ) {
    return macro.call("javascript.feature").then(function (result) {
      let dom = JSDOM.fragment(result);
      let browserIcons = Array.from(dom.querySelectorAll(".bc-browsers span"));
      assert.equal(
        browserIcons[0].classList.contains("bc-head-icon-chrome"),
        true
      );
      assert.equal(
        browserIcons[1].classList.contains("bc-head-icon-edge"),
        true
      );
      assert.equal(
        browserIcons[2].classList.contains("bc-head-icon-firefox"),
        true
      );
      assert.equal(browserIcons[3].classList.contains("bc-head-icon-ie"), true);
      assert.equal(
        browserIcons[4].classList.contains("bc-head-icon-opera"),
        true
      );
      assert.equal(
        browserIcons[5].classList.contains("bc-head-icon-safari"),
        true
      );
      assert.equal(
        browserIcons[6].classList.contains("bc-head-icon-webview_android"),
        true
      );
      assert.equal(
        browserIcons[7].classList.contains("bc-head-icon-chrome_android"),
        true
      );
      assert.equal(
        browserIcons[8].classList.contains("bc-head-icon-firefox_android"),
        true
      );
      assert.equal(
        browserIcons[9].classList.contains("bc-head-icon-opera_android"),
        true
      );
      assert.equal(
        browserIcons[10].classList.contains("bc-head-icon-safari_ios"),
        true
      );
      assert.equal(
        browserIcons[11].classList.contains(
          "bc-head-icon-samsunginternet_android"
        ),
        true
      );
      assert.equal(
        browserIcons[12].classList.contains("bc-head-icon-nodejs"),
        true
      );
    });
  });

  itMacro("Adds correct text label for browsers to head of table", function (
    macro
  ) {
    return macro.call("javascript.feature").then(function (result) {
      let dom = JSDOM.fragment(result);
      let browserIcons = Array.from(dom.querySelectorAll(".bc-browsers span"));
      assert.equal(browserIcons[0].textContent, "Chrome");
      assert.equal(browserIcons[1].textContent, "Edge");
      assert.equal(browserIcons[2].textContent, "Firefox");
      assert.equal(browserIcons[3].textContent, "Internet Explorer");
      assert.equal(browserIcons[4].textContent, "Opera");
      assert.equal(browserIcons[5].textContent, "Safari");
      assert.equal(browserIcons[6].textContent, "Android webview");
      assert.equal(browserIcons[7].textContent, "Chrome for Android");
      assert.equal(browserIcons[8].textContent, "Firefox for Android");
      assert.equal(browserIcons[9].textContent, "Opera for Android");
      assert.equal(browserIcons[10].textContent, "Safari on iOS");
      assert.equal(browserIcons[11].textContent, "Samsung Internet");
      assert.equal(browserIcons[12].textContent, "Node.js");
    });
  });
});
