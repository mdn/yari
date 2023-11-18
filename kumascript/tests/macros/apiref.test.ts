import fs from "node:fs";

import { JSDOM } from "jsdom";
import { jest } from "@jest/globals";

import {
  beforeEachMacro,
  describeMacro,
  itMacro,
  lintHTML,
  parsePagesFixture,
} from "./utils.js";

/**
 * Load all the fixtures.
 */

const subpagesFixturePath = new URL(
  "./fixtures/apiref/subpages.json",
  import.meta.url
);
const subpagesFixture = parsePagesFixture(subpagesFixturePath);
const commonl10nFixturePath = new URL(
  "./fixtures/apiref/commonl10n.json",
  import.meta.url
);
const commonl10nFixture = JSON.parse(
  fs.readFileSync(commonl10nFixturePath, "utf-8")
);
const groupDataFixturePath = new URL(
  "./fixtures/apiref/groupdata.json",
  import.meta.url
);
const groupDataFixture = JSON.parse(
  fs.readFileSync(groupDataFixturePath, "utf-8")
);
const interfaceDataNoEntriesFixturePath = new URL(
  "./fixtures/apiref/interfacedata_no_entries.json",
  import.meta.url
);
const interfaceDataNoEntriesFixture = fs.readFileSync(
  interfaceDataNoEntriesFixturePath,
  "utf-8"
);
const interfaceDataFixturePath = new URL(
  "./fixtures/apiref/interfacedata.json",
  import.meta.url
);
const interfaceDataFixture = JSON.parse(
  fs.readFileSync(interfaceDataFixturePath, "utf-8")
);

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

const expectedStaticProperties = {
  "en-US": [
    {
      badges: [],
      text: "MyTestStaticProperty1",
      target: "/en-US/docs/Web/API/TestInterface/TestStaticProperty1",
      title:
        "The TestStaticProperty1 property of the TestInterface interface has no badges.",
    },
  ],
  fr: [
    {
      badges: [],
      text: "MyTestStaticProperty1",
      target: "/fr/docs/Web/API/TestInterface/TestStaticProperty1",
      title:
        "The TestStaticProperty1 property of the TestInterface interface has no badges.",
    },
  ],
  ja: [
    {
      badges: [],
      text: "MyTestStaticProperty1",
      target: "/ja/docs/Web/API/TestInterface/TestStaticProperty1",
      title:
        "The TestStaticProperty1 property of the TestInterface interface has no badges (ja translation).",
    },
  ],
};

const expectedInstanceProperties = {
  "en-US": [
    {
      badges: [],
      text: "MyTestInstanceProperty1",
      target: "/en-US/docs/Web/API/TestInterface/MyTestInstanceProperty1",
      title:
        "The MyTestInstanceProperty1 property of the TestInterface interface has no badges.",
    },
  ],
  fr: [
    {
      badges: [],
      text: "MyTestInstanceProperty1",
      target: "/fr/docs/Web/API/TestInterface/MyTestInstanceProperty1",
      title:
        "The MyTestInstanceProperty1 property of the TestInterface interface has no badges.",
    },
  ],
  ja: [
    {
      badges: [],
      text: "MyTestInstanceProperty1",
      target: "/ja/docs/Web/API/TestInterface/MyTestInstanceProperty1",
      title:
        "The MyTestInstanceProperty1 property of the TestInterface interface has no badges (ja translation).",
    },
  ],
};

const expectedStaticMethods = {
  "en-US": [
    {
      badges: ["icon-experimental"],
      text: "MyTestStaticMethod1",
      target: "/en-US/docs/Web/API/TestInterface/MyTestStaticMethod1",
      title:
        "The MyTestStaticMethod1 property of the TestInterface interface is experimental.",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestStaticMethod2",
      target: "/en-US/docs/Web/API/TestInterface/MyTestStaticMethod2",
      title:
        "The MyTestStaticMethod2 property of the TestInterface interface is deprecated and non-standard.",
    },
    {
      badges: ["icon-experimental", "icon-deprecated", "icon-nonstandard"],
      text: "MyTestStaticMethod3",
      target: "/en-US/docs/Web/API/TestInterface/MyTestStaticMethod3",
      title:
        "The MyTestStaticMethod3 property of the TestInterface interface has all the badges.",
    },
  ],
  fr: [
    {
      badges: ["icon-experimental"],
      text: "MyTestStaticMethod1",
      target: "/fr/docs/Web/API/TestInterface/MyTestStaticMethod1",
      title:
        "The MyTestStaticMethod1 property of the TestInterface interface is experimental.",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestStaticMethod2",
      target: "/fr/docs/Web/API/TestInterface/MyTestStaticMethod2",
      title:
        "The MyTestStaticMethod2 property of the TestInterface interface is deprecated and non-standard.",
    },
    {
      badges: ["icon-experimental", "icon-deprecated", "icon-nonstandard"],
      text: "MyTestStaticMethod3",
      target: "/fr/docs/Web/API/TestInterface/MyTestStaticMethod3",
      title:
        "The MyTestStaticMethod3 property of the TestInterface interface has all the badges.",
    },
  ],
  ja: [
    {
      badges: ["icon-experimental"],
      text: "MyTestStaticMethod1",
      target: "/ja/docs/Web/API/TestInterface/MyTestStaticMethod1",
      title:
        "The MyTestStaticMethod1 property of the TestInterface interface is experimental (ja translation).",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestStaticMethod2",
      target: "/ja/docs/Web/API/TestInterface/MyTestStaticMethod2",
      title:
        "The MyTestStaticMethod2 property of the TestInterface interface is deprecated and non-standard (ja translation).",
    },
    {
      badges: ["icon-experimental", "icon-deprecated", "icon-nonstandard"],
      text: "MyTestStaticMethod3",
      target: "/ja/docs/Web/API/TestInterface/MyTestStaticMethod3",
      title:
        "The MyTestStaticMethod3 property of the TestInterface interface has all the badges (ja translation).",
    },
  ],
};

const expectedInstanceMethods = {
  "en-US": [
    {
      badges: ["icon-experimental"],
      text: "MyTestInstanceMethod1",
      target: "/en-US/docs/Web/API/TestInterface/MyTestInstanceMethod1",
      title:
        "The MyTestInstanceMethod1 property of the TestInterface interface is experimental.",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestInstanceMethod2",
      target: "/en-US/docs/Web/API/TestInterface/MyTestInstanceMethod2",
      title:
        "The MyTestInstanceMethod2 property of the TestInterface interface is deprecated and non-standard.",
    },
    {
      badges: ["icon-experimental", "icon-deprecated", "icon-nonstandard"],
      text: "MyTestInstanceMethod3",
      target: "/en-US/docs/Web/API/TestInterface/MyTestInstanceMethod3",
      title:
        "The MyTestInstanceMethod3 property of the TestInterface interface has all the badges.",
    },
  ],
  fr: [
    {
      badges: ["icon-experimental"],
      text: "MyTestInstanceMethod1",
      target: "/fr/docs/Web/API/TestInterface/MyTestInstanceMethod1",
      title:
        "The MyTestInstanceMethod1 property of the TestInterface interface is experimental.",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestInstanceMethod2",
      target: "/fr/docs/Web/API/TestInterface/MyTestInstanceMethod2",
      title:
        "The MyTestInstanceMethod2 property of the TestInterface interface is deprecated and non-standard.",
    },
    {
      badges: ["icon-experimental", "icon-deprecated", "icon-nonstandard"],
      text: "MyTestInstanceMethod3",
      target: "/fr/docs/Web/API/TestInterface/MyTestInstanceMethod3",
      title:
        "The MyTestInstanceMethod3 property of the TestInterface interface has all the badges.",
    },
  ],
  ja: [
    {
      badges: ["icon-experimental"],
      text: "MyTestInstanceMethod1",
      target: "/ja/docs/Web/API/TestInterface/MyTestInstanceMethod1",
      title:
        "The MyTestInstanceMethod1 property of the TestInterface interface is experimental (ja translation).",
    },
    {
      badges: ["icon-deprecated", "icon-nonstandard"],
      text: "MyTestInstanceMethod2",
      target: "/ja/docs/Web/API/TestInterface/MyTestInstanceMethod2",
      title:
        "The MyTestInstanceMethod2 property of the TestInterface interface is deprecated and non-standard (ja translation).",
    },
    {
      badges: ["icon-experimental", "icon-deprecated", "icon-nonstandard"],
      text: "MyTestInstanceMethod3",
      target: "/ja/docs/Web/API/TestInterface/MyTestInstanceMethod3",
      title:
        "The MyTestInstanceMethod3 property of the TestInterface interface has all the badges (ja translation).",
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
    staticProperties: expectedStaticProperties,
    instanceProperties: expectedInstanceProperties,
    staticMethods: expectedStaticMethods,
    instanceMethods: expectedInstanceMethods,
    events: expectedEvents,
  },
};

const expectedWithGroupData = {
  mainIfLink: expectedMainIfLink.withGroupData,
  details: {
    staticProperties: expectedStaticProperties,
    instanceProperties: expectedInstanceProperties,
    staticMethods: expectedStaticMethods,
    instanceMethods: expectedInstanceMethods,
    events: expectedEvents,
    related: expectedRelated,
  },
};

const expectedWithInterfaceData = {
  mainIfLink: expectedMainIfLink.withoutGroupData,
  details: {
    staticProperties: expectedStaticProperties,
    instanceProperties: expectedInstanceProperties,
    staticMethods: expectedStaticMethods,
    instanceMethods: expectedInstanceMethods,
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

    if (methodLink.href !== "") {
      expect(methodLink.href).toEqual(expected.target);
    } else {
      // if the page this would link to has not yet been created,
      // `smartLink` will remove the `href` attribute and add
      // a `class` with the value `page-not-created`
      expect(methodLink.classList.toString()).toEqual("page-not-created");
    }
  } else {
    // If we are on the current page, the item is just an <i>
    // and the text contents omits the CTA
    const methodLink = actual.querySelector("a");
    expect(methodLink).toBeNull();
    const methodName = actual.querySelector(".icon");
    expect(actual.textContent).toContain(methodName.textContent);
  }

  // Test that the badges are what we expect
  const badgeClasses = actual.querySelectorAll(".icon");
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

  if (itemLink.href !== "") {
    expect(itemLink.href).toEqual(`/${config.locale}${expected.target}`);
  } else {
    // if the page this would link to has not yet been created,
    // `smartLink` will remove the `href` attribute and add
    // a `class` with the value `page-not-created`
    expect(itemLink.classList.toString()).toEqual("page-not-created");
  }
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
  const mainIfLink = dom.querySelector<HTMLAnchorElement>("ol>li>strong>a");
  expect(mainIfLink.textContent).toEqual(config.expected.mainIfLink.text);

  if (mainIfLink.href !== "") {
    expect(mainIfLink.href).toEqual(
      `/${config.locale}${config.expected.mainIfLink.target}`
    );
  } else {
    // if the page this would link to has not yet been created,
    // `smartLink` will remove the `href` attribute and add
    // a `class` with the value `page-not-created`
    expect(mainIfLink.classList.toString()).toEqual("page-not-created");
  }

  // Test sublists
  const details = dom.querySelectorAll("ol>li>details");
  expect(details.length).toEqual(Object.keys(config.expected.details).length);

  // Test the static properties sublist
  const expectedStaticPropertySummary =
    commonl10nFixture.Static_properties[config.locale];
  const expectedStaticPropertyItems =
    config.expected.details.staticProperties[config.locale];
  const staticProperties = details[0];
  checkItemList(
    expectedStaticPropertySummary,
    expectedStaticPropertyItems,
    staticProperties,
    config,
    checkInterfaceItem
  );

  // Test the instance properties sublist
  const expectedInstancePropertySummary =
    commonl10nFixture.Instance_properties[config.locale];
  const expectedInstancePropertyItems =
    config.expected.details.instanceProperties[config.locale];
  const instanceProperties = details[1];
  checkItemList(
    expectedInstancePropertySummary,
    expectedInstancePropertyItems,
    instanceProperties,
    config,
    checkInterfaceItem
  );

  // Test the static methods sublist
  const expectedStaticMethodSummary =
    commonl10nFixture.Static_methods[config.locale];
  const expectedStaticMethodItems =
    config.expected.details.staticMethods[config.locale];
  const staticMethods = details[2];
  checkItemList(
    expectedStaticMethodSummary,
    expectedStaticMethodItems,
    staticMethods,
    config,
    checkInterfaceItem
  );

  // Test the instance methods sublist
  const expectedInstanceMethodSummary =
    commonl10nFixture.Instance_methods[config.locale];
  const expectedInstanceMethodItems =
    config.expected.details.instanceMethods[config.locale];
  const instanceMethods = details[3];
  checkItemList(
    expectedInstanceMethodSummary,
    expectedInstanceMethodItems,
    instanceMethods,
    config,
    checkInterfaceItem
  );

  // Test the events sublist
  const expectedEventSummary = commonl10nFixture.Events[config.locale];
  const expectedEventItems = config.expected.details.events[config.locale];
  const events = details[4];
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
    const expectedInheritedSummary =
      commonl10nFixture.Inheritance[config.locale];
    const expectedInheritedItems = config.expected.details.inherited;
    const inherited = details[5];
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
      commonl10nFixture.Implemented_by[config.locale];
    const expectedImplementedItems = config.expected.details.implemented;
    const implemented = details[6];
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
    const expectedRelatedSummary = commonl10nFixture.Related_pages[
      config.locale
    ].replace("$1", config.argument);
    const expectedRelatedItems = config.expected.details.related;
    const related = details[5];
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
      // Mock calls to getJSONData()
      macro.ctx.web.getJSONData = jest.fn((name) => {
        if (name === "GroupData") {
          return groupDataFixture;
        }
        if (name === "L10n-Common") {
          return commonl10nFixture;
        }
        if (name === "InterfaceData") {
          return config.interfaceData;
        }
        throw new Error(`Unimplmeneted mock fixture ${name}`);
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
    name: "slug: 'Web/API/TestInterface/TestStaticMethod1'; no InterfaceData entries; no argument",
    currentSlug: "Web/API/TestInterface/TestStaticMethod1",
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
