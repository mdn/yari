/**
 * @prettier
 */
const { JSDOM } = require("jsdom");

const {
  beforeEachMacro,
  describeMacro,
  itMacro,
  lintHTML,
} = require("./utils");

/**
 * Load all the fixtures.
 */
const fs = require("fs");
const path = require("path");
const subpagesFixturePath = path.resolve(
  __dirname,
  "fixtures/apiref/subpages.json"
);
const subpagesFixture = JSON.parse(
  fs.readFileSync(subpagesFixturePath, "utf8")
);
const commonl10nFixturePath = path.resolve(
  __dirname,
  "fixtures/apiref/commonl10n.json"
);
const commonl10nFixture = fs.readFileSync(commonl10nFixturePath, "utf8");
const commonL10nJSON = JSON.parse(commonl10nFixture);
const groupDataFixturePath = path.resolve(
  __dirname,
  "fixtures/apiref/groupdata.json"
);
const groupDataFixture = fs.readFileSync(groupDataFixturePath, "utf8");
const interfaceDataNoEntriesFixturePath = path.resolve(
  __dirname,
  "fixtures/apiref/interfacedata_no_entries.json"
);
const interfaceDataNoEntriesFixture = fs.readFileSync(
  interfaceDataNoEntriesFixturePath,
  "utf8"
);
const interfaceDataFixturePath = path.resolve(
  __dirname,
  "fixtures/apiref/interfacedata.json"
);
const interfaceDataFixture = fs.readFileSync(interfaceDataFixturePath, "utf8");

/**
 * All the const objects that follow define bits of the data we expect.
 **/
const expectedMainIfLink = {
  withGroupData: {
    text: "TestInterface API",
    target: "/docs/Web/API/TestInterface_API",
  },
  withoutGroupData: {
    text: "TestInterface",
    target: "/docs/Web/API/TestInterface",
  },
};

const expectedProperties = {
  "en-US": [
    {
      badges: [],
      text: "MyTestProperty1",
      target: "/en-US/docs/Web/API/TestInterface/TestProperty1",
      title:
        "The MyTestProperty1 property of the TestInterface interface has no badges.",
    },
  ],
  fr: [
    {
      badges: [],
      text: "MyTestProperty1",
      target: "/fr/docs/Web/API/TestInterface/TestProperty1",
      title:
        "The MyTestProperty1 property of the TestInterface interface has no badges.",
    },
  ],
  ja: [
    {
      badges: [],
      text: "MyTestProperty1",
      target: "/ja/docs/Web/API/TestInterface/TestProperty1",
      title:
        "The MyTestProperty1 property of the TestInterface interface has no badges (ja translation).",
    },
  ],
};

const expectedMethods = {
  "en-US": [
    {
      badges: ["icon-experimental"],
      text: "MyTestMethod1",
      target: "/en-US/docs/Web/API/TestInterface/TestMethod1",
      title:
        "The MyTestMethod1 property of the TestInterface interface is experimental.",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestMethod2",
      target: "/en-US/docs/Web/API/TestInterface/TestMethod2",
      title:
        "The MyTestMethod2 property of the TestInterface interface is deprecated and non-standard.",
    },
    {
      badges: [
        "icon-experimental",
        "icon-deprecated",
        "icon-nonstandard",
        "obsolete",
      ],
      text: "MyTestMethod3",
      target: "/en-US/docs/Web/API/TestInterface/TestMethod3",
      title:
        "The MyTestMethod3 property of the TestInterface interface has all the badges.",
    },
  ],
  fr: [
    {
      badges: ["icon-experimental"],
      text: "MyTestMethod1",
      target: "/fr/docs/Web/API/TestInterface/TestMethod1",
      title:
        "The MyTestMethod1 property of the TestInterface interface is experimental.",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestMethod2",
      target: "/fr/docs/Web/API/TestInterface/TestMethod2",
      title:
        "The MyTestMethod2 property of the TestInterface interface is deprecated and non-standard.",
    },
    {
      badges: [
        "icon-experimental",
        "icon-deprecated",
        "icon-nonstandard",
        "obsolete",
      ],
      text: "MyTestMethod3",
      target: "/fr/docs/Web/API/TestInterface/TestMethod3",
      title:
        "The MyTestMethod3 property of the TestInterface interface has all the badges.",
    },
  ],
  ja: [
    {
      badges: ["icon-experimental"],
      text: "MyTestMethod1",
      target: "/ja/docs/Web/API/TestInterface/TestMethod1",
      title:
        "The MyTestMethod1 property of the TestInterface interface is experimental (ja translation).",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestMethod2",
      target: "/ja/docs/Web/API/TestInterface/TestMethod2",
      title:
        "The MyTestMethod2 property of the TestInterface interface is deprecated and non-standard (ja translation).",
    },
    {
      badges: [
        "icon-experimental",
        "icon-deprecated",
        "icon-nonstandard",
        "obsolete",
      ],
      text: "MyTestMethod3",
      target: "/ja/docs/Web/API/TestInterface/TestMethod3",
      title:
        "The MyTestMethod3 property of the TestInterface interface has all the badges (ja translation).",
    },
  ],
};

const expectedEvents = {
  "en-US": [
    {
      badges: [],
      text: "TestEvent1",
      target: "/en-US/docs/Web/API/TestInterface/TestEvent1",
      title:
        "The MyTestEvent1 event of the TestInterface interface has no badges.",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "TestEvent2",
      target: "/en-US/docs/Web/API/TestInterface/TestEvent2",
      title:
        "The MyTestEvent2 event of the TestInterface interface is deprecated and non-standard.",
    },
    {
      badges: [],
      text: "TestEvent3_another_suffix",
      target: "/en-US/docs/Web/API/TestInterface/TestEvent3",
      title:
        "The MyTestEvent3 event of the TestInterface interface has no badges.",
    },
  ],
  fr: [
    {
      badges: [],
      text: "TestEvent1",
      target: "/fr/docs/Web/API/TestInterface/TestEvent1",
      title:
        "The MyTestEvent1 event of the TestInterface interface has no badges.",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "TestEvent2",
      target: "/fr/docs/Web/API/TestInterface/TestEvent2",
      title:
        "The MyTestEvent2 event of the TestInterface interface is deprecated and non-standard.",
    },
    {
      badges: [],
      text: "TestEvent3_another_suffix",
      target: "/fr/docs/Web/API/TestInterface/TestEvent3",
      title:
        "The MyTestEvent3 event of the TestInterface interface has no badges.",
    },
  ],
  ja: [
    {
      badges: [],
      text: "TestEvent1",
      target: "/ja/docs/Web/API/TestInterface/TestEvent1",
      title:
        "The MyTestEvent1 event of the TestInterface interface has no badges (ja translation).",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "TestEvent2",
      target: "/ja/docs/Web/API/TestInterface/TestEvent2",
      title:
        "The MyTestEvent2 event of the TestInterface interface is deprecated and non-standard (ja translation).",
    },
    {
      badges: [],
      text: "TestEvent3_another_suffix",
      target: "/ja/docs/Web/API/TestInterface/TestEvent3",
      title:
        "The MyTestEvent3 event of the TestInterface interface has no badges (ja translation).",
    },
  ],
};

const expectedRelated = [
  {
    text: "AnInterface",
    target: "/docs/Web/API/AnInterface",
  },
  {
    text: "AnInterface.doOneThing()",
    target: "/docs/Web/API/AnInterface/doOneThing",
  },
  {
    text: "AnotherInterface.doAnother()",
    target: "/docs/Web/API/AnotherInterface/doAnother",
  },
];

const expectedInherited = [
  {
    text: "TestInterfaceParent",
    target: "/docs/Web/API/TestInterfaceParent",
  },
  {
    text: "TestInterfaceGrandparent",
    target: "/docs/Web/API/TestInterfaceGrandparent",
  },
];

const expectedImplemented = [
  {
    text: "AlsoImplementsTestInterface",
    target: "/docs/Web/API/AlsoImplementsTestInterface",
  },
  {
    text: "ImplementsTestInterface",
    target: "/docs/Web/API/ImplementsTestInterface",
  },
];

const expectedBasic = {
  mainIfLink: expectedMainIfLink.withoutGroupData,
  details: {
    properties: expectedProperties,
    methods: expectedMethods,
    events: expectedEvents,
  },
};

const expectedWithGroupData = {
  mainIfLink: expectedMainIfLink.withGroupData,
  details: {
    properties: expectedProperties,
    methods: expectedMethods,
    events: expectedEvents,
    related: expectedRelated,
  },
};

const expectedWithInterfaceData = {
  mainIfLink: expectedMainIfLink.withoutGroupData,
  details: {
    properties: expectedProperties,
    methods: expectedMethods,
    events: expectedEvents,
    inherited: expectedInherited,
    implemented: expectedImplemented,
  },
};

/**
 * This function is used to compare two sidebar items that
 * represent interface items, like methods and properties.
 */
function checkInterfaceItem(actual, expected, config) {
  // Are we on the page that this link points to?
  const linkSlug = expected.target.split("/").slice(3).join("/");
  if (config.currentSlug != linkSlug) {
    // If we are not on this page, the item contains a link
    // and the text contents includes a CTA if one should be present
    // (CTA is specified in the test data in the cases where it is expected)
    expect(actual.textContent).toContain(expected.text);
    const methodLink = actual.querySelector("a");
    expect(methodLink.href).toEqual(expected.target);
  } else {
    // If we are on the current page, the item is just an <i>
    // and the text contents omits the CTA
    const methodLink = actual.querySelector("a");
    expect(methodLink).toBeNull();
    const methodName = actual.querySelector("svg");
    expect(actual.textContent).toContain(methodName.textContent);
  }

  // Test that the badges are what we expect
  const badgeClasses = actual.querySelectorAll("svg");
  expect(badgeClasses.length).toEqual(expected.badges.length);
  for (const badgeClass of badgeClasses) {
    badgeClass.classList.forEach((value) => {
      if (value !== "icon") {
        expect(expected.badges).toContain(value);
      }
    });
  }
}

/**
 * This function is used to compare two sidebar items that
 * represent related items, like related interfaces got from GroupData.
 */
function checkRelatedItem(actual, expected, config) {
  const itemLink = actual.querySelector("a");
  // For these items we just have to compare textContent and href
  expect(itemLink.textContent).toEqual(expected.text);
  expect(itemLink.href).toEqual(`/${config.locale}${expected.target}`);
}

function checkItemList(
  expectedSummary,
  expectedItems,
  actual,
  config,
  compareItemFunction
) {
  const actualSummary = actual.querySelector("summary");
  expect(actualSummary.textContent).toEqual(expectedSummary);

  const actualItems = actual.querySelectorAll("ol>li");
  expect(actualItems.length).toEqual(expectedItems.length);
  for (let i = 0; i < actualItems.length; i++) {
    compareItemFunction(actualItems[i], expectedItems[i], config);
  }
}

/**
 * This is the entry point for checking the result of a test.
 * config.expected contains the expected results, and we use other bits
 * of config, most notably locale
 */
function checkResult(html, config) {
  // Lint the HTML
  expect(lintHTML(html)).toBeFalsy();

  const dom = JSDOM.fragment(html);
  // Check that all links reference the proper locale or use https
  const num_total_links = dom.querySelectorAll("a[href]").length;
  const num_valid_links = dom.querySelectorAll(
    `a[href^="/${config.locale}/"], a[href^="https://"]`
  ).length;
  expect(num_valid_links).toEqual(num_total_links);

  // Test main interface link
  const mainIfLink = dom.querySelector("ol>li>strong>a");
  expect(mainIfLink.textContent).toEqual(config.expected.mainIfLink.text);
  expect(mainIfLink.href).toEqual(
    `/${config.locale}${config.expected.mainIfLink.target}`
  );

  // Test sublists
  const details = dom.querySelectorAll("ol>li>details");
  expect(details.length).toEqual(Object.keys(config.expected.details).length);

  // Test the properties sublist
  const expectedPropertySummary = commonL10nJSON.Properties[config.locale];
  const expectedPropertyItems =
    config.expected.details.properties[config.locale];
  const properties = details[0];
  checkItemList(
    expectedPropertySummary,
    expectedPropertyItems,
    properties,
    config,
    checkInterfaceItem
  );

  // Test the methods sublist
  const expectedMethodSummary = commonL10nJSON.Methods[config.locale];
  const expectedMethodItems = config.expected.details.methods[config.locale];
  const methods = details[1];
  checkItemList(
    expectedMethodSummary,
    expectedMethodItems,
    methods,
    config,
    checkInterfaceItem
  );

  // Test the events sublist
  const expectedEventSummary = commonL10nJSON.Events[config.locale];
  const expectedEventItems = config.expected.details.events[config.locale];
  const events = details[2];
  checkItemList(
    expectedEventSummary,
    expectedEventItems,
    events,
    config,
    checkInterfaceItem
  );

  const hasInherited = config.expected.details.inherited;
  if (hasInherited) {
    // Test the inherited sublist
    const expectedInheritedSummary = commonL10nJSON.Inheritance[config.locale];
    const expectedInheritedItems = config.expected.details.inherited;
    const inherited = details[3];
    checkItemList(
      expectedInheritedSummary,
      expectedInheritedItems,
      inherited,
      config,
      checkRelatedItem
    );
  }

  const hasImplemented = config.expected.details.implemented;
  if (hasImplemented) {
    // Test the implemented_by sublist
    const expectedImplementedSummary =
      commonL10nJSON.Implemented_by[config.locale];
    const expectedImplementedItems = config.expected.details.implemented;
    const implemented = details[4];
    checkItemList(
      expectedImplementedSummary,
      expectedImplementedItems,
      implemented,
      config,
      checkRelatedItem
    );
  }

  const hasRelated = config.expected.details.related;
  if (hasRelated) {
    // Test the related sublist
    const expectedRelatedSummary = commonL10nJSON.Related_pages[
      config.locale
    ].replace("$1", config.argument);
    const expectedRelatedItems = config.expected.details.related;
    const related = details[3];
    checkItemList(
      expectedRelatedSummary,
      expectedRelatedItems,
      related,
      config,
      checkRelatedItem
    );
  }
}

function testMacro(config) {
  for (const locale of ["en-US", "fr", "ja"]) {
    const testName = `${config.name}; locale: ${locale}`;
    itMacro(testName, function (macro) {
      config.locale = locale;
      macro.ctx.env.slug = config.currentSlug;
      macro.ctx.env.locale = locale;
      // Mock calls to L10n-Common, GroupData, and InterfaceData
      const originalTemplate = macro.ctx.template;
      macro.ctx.template = jest.fn(async (name, ...args) => {
        if (name === "L10n:Common") {
          return commonl10nFixture;
        }
        if (name === "GroupData") {
          return groupDataFixture;
        }
        if (name === "InterfaceData") {
          return config.interfaceData;
        }
        return await originalTemplate(name, ...args);
      });
      if (config.argument) {
        return macro.call(config.argument).then(function (result) {
          checkResult(result, config);
        });
      }
      return macro.call().then(function (result) {
        checkResult(result, config);
      });
    });
  }
}

describeMacro("APIRef", function () {
  beforeEachMacro(function (macro) {
    // Mock calls to MDN.subpagesExpand
    macro.ctx.page.subpagesExpand = jest.fn((page) => {
      expect(page).toEqual("/en-US/docs/Web/API/TestInterface");
      return subpagesFixture;
    });
  });

  // Test with current page as main interface page
  testMacro({
    name: "slug: 'Web/API/TestInterface'; no InterfaceData entries; no argument",
    currentSlug: "Web/API/TestInterface",
    argument: null,
    interfaceData: interfaceDataNoEntriesFixture,
    expected: expectedBasic,
  });

  // Test with current page as a subpage
  testMacro({
    name: "slug: 'Web/API/TestInterface/TestMethod1'; no InterfaceData entries; no argument",
    currentSlug: "Web/API/TestInterface/TestMethod1",
    argument: null,
    interfaceData: interfaceDataNoEntriesFixture,
    expected: expectedBasic,
  });

  // Test with an argument to use in GroupData
  testMacro({
    name: "slug: 'Web/API/TestInterface'; no InterfaceData entries; argument: 'TestInterface'",
    currentSlug: "Web/API/TestInterface",
    argument: "TestInterface",
    interfaceData: interfaceDataNoEntriesFixture,
    expected: expectedWithGroupData,
  });

  // Test with a nonexistent but non-null argument to use in GroupData
  testMacro({
    name: "slug: 'Web/API/TestInterface'; no InterfaceData entries; argument: 'I don't exist'",
    currentSlug: "Web/API/TestInterface",
    argument: "I don't exist",
    interfaceData: interfaceDataNoEntriesFixture,
    expected: expectedBasic,
  });

  // Test with an InterfaceData that contains data for TestInterface
  testMacro({
    name: "slug: 'Web/API/TestInterface'; InterfaceData entries expected; no argument",
    currentSlug: "Web/API/TestInterface",
    argument: null,
    interfaceData: interfaceDataFixture,
    expected: expectedWithInterfaceData,
  });
});
