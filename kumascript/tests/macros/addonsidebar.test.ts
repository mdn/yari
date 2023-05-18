import { JSDOM } from "jsdom";
import { jest } from "@jest/globals";

import { beforeEachMacro, describeMacro, itMacro, lintHTML } from "./utils.js";

const SUMMARIES = {
  "en-US": [
    "Getting started",
    "Concepts",
    "User interface",
    "How to",
    "JavaScript APIs",
    "Manifest keys",
    "Extension Workshop",
    "Channels",
  ],
  fr: [
    "Commencer",
    "Concepts",
    "Interface utilisateur",
    "Mode d'emploi",
    "Les API JavaScript",
    "Clés de manifeste",
    "Atelier des extensions",
    "Canaux de discussions",
  ],
  ja: [
    "始めましょう",
    "概念",
    "ユーザーインターフェイス",
    "逆引きリファレンス",
    "JavaScript API 群",
    "Manifest keys",
    "Extension Workshop",
    "チャンネル",
  ],
  "zh-CN": [
    "开始",
    "概念",
    "用户界面",
    "怎么做",
    "JavaScript APIs",
    "Manifest keys",
    "Extension Workshop",
    "渠道",
  ],
  es: [
    "Comenzar",
    "Conceptos",
    "Interfaz de usuario",
    "Cómo hacer",
    "API de JavaScript",
    "Claves de manifiesto",
    "Taller de Extensión",
    "Canales de discusión",
  ],
};

const MANIFEST_SLUG = "Mozilla/Add-ons/WebExtensions/manifest.json";

function getMockResultForGetChildren(doc_url) {
  const locale = new URL(doc_url, "http://example.com").pathname.split("/")[1];
  return [
    {
      locale: `${locale}`,
      url: `/${locale}/docs/${MANIFEST_SLUG}/author`,
      subpages: [],
      slug: `${MANIFEST_SLUG}/author`,
      title: "author",
    },
    {
      locale: `${locale}`,
      url: `/${locale}/docs/${MANIFEST_SLUG}/background`,
      subpages: [],
      slug: `${MANIFEST_SLUG}/background`,
      title: "background",
    },
    {
      locale: `${locale}`,
      url: `/${locale}/docs/${MANIFEST_SLUG}/theme`,
      subpages: [],
      slug: `${MANIFEST_SLUG}/theme`,
      title: "theme",
    },
    {
      locale: `${locale}`,
      url: `/${locale}/docs/${MANIFEST_SLUG}/version`,
      subpages: [],
      slug: `${MANIFEST_SLUG}/version`,
      title: "version",
    },
  ];
}

function checkSidebarResult(html, locale, isUnderWebExtAPI = false) {
  // Lint the HTML
  expect(lintHTML(html)).toBeFalsy();
  const dom = JSDOM.fragment(html);
  const section = dom.querySelector("section#Quick_links");
  // Check the basics
  expect(section).toBeTruthy();
  // Check the total number of top-level list items that can be toggled
  expect(section.querySelectorAll("ol > li.toggle")).toHaveLength(
    SUMMARIES[locale].length
  );
  // Check that all links reference the proper locale or use https
  const num_total_links = section.querySelectorAll("a[href]").length;
  const num_valid_links = section.querySelectorAll(
    `a[href^="/${locale}/docs/Mozilla/Add-ons"], a[href^="https://"]`
  ).length;
  expect(num_valid_links).toBe(num_total_links);
  // Check whether the 'JavaScript APIs' summary, and only that summary,
  // is open, or if all of the summaries are closed, which depends on
  // whether or not the slug of the page is under the "WebExtensions/API".
  const num_details_open = section.querySelectorAll(
    "ol > li.toggle > details[open]"
  ).length;
  if (isUnderWebExtAPI) {
    expect(num_details_open).toBe(1);
  } else {
    expect(num_details_open).toBe(0);
  }
  // Check a sample of the DOM for localized content
  for (const node of section.querySelectorAll("summary")) {
    expect(SUMMARIES[locale]).toContain(node.textContent);
  }
  // Check for the "WebExtensions/manifest.json" details, which should have
  // been added by the call to wiki.tree within AddonSidebar.ejs.
  for (const name of ["author", "background", "theme", "version"]) {
    const href = `/${locale}/docs/${MANIFEST_SLUG}/${name}`;
    expect(section.querySelector(`li > a[href="${href}"]`)).toBeTruthy();
  }
}

describeMacro("AddonSidebar", function () {
  beforeEachMacro(function (macro) {
    // Mock the call to template('WebExtAPISidebar', []).
    macro.ctx.template = jest.fn(() => {
      // This template will be tested on its own, so nothing needed here.
      return "";
    });
    // Mock calls to info.getChildren, which indirectly mocks the
    // call to wiki.tree within AddonSidebar.ejs.
    macro.ctx.info.getChildren = jest.fn(getMockResultForGetChildren);
  });

  for (const locale of ["en-US", "fr", "ja"]) {
    itMacro(`with locale ${locale}`, function (macro) {
      macro.ctx.env.locale = locale;
      macro.ctx.env.slug = "Mozilla/Add-ons/AMO";
      return macro.call().then(function (result) {
        expect(macro.ctx.template).toHaveBeenCalledTimes(1);
        checkSidebarResult(result, locale);
      });
    });
    itMacro(`with locale ${locale} under WebExtensions/API`, function (macro) {
      macro.ctx.env.locale = locale;
      macro.ctx.env.slug = "Mozilla/Add-ons/WebExtensions/API/alarms";
      return macro.call().then(function (result) {
        expect(macro.ctx.template).toHaveBeenCalledTimes(1);
        checkSidebarResult(result, locale, true);
      });
    });
  }
});
