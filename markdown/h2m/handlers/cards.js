import Gettext from "node-gettext";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { DEFAULT_LOCALE } from "@mdn/yari/libs/constants/index.js";
import { h } from "../h.js";
import { asArray } from "../utils.js";
import { toText } from "./to-text.js";

const gettextLocalizationMap = (() => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const require = createRequire(import.meta.url);
  const getTextDefaultDomainName = "messages";
  let gtLocalizationMap = new Map();
  let localesOnFS = fs
    .readdirSync(path.join(__dirname, "../../localizations"))
    .map((str) => str.split(".")[0]);
  localesOnFS.forEach((localeStr) => {
    const translations = require("../../localizations/" + localeStr + ".json");
    const gt = new Gettext();
    gt.addTranslations(localeStr, getTextDefaultDomainName, translations);
    gt.setLocale(localeStr);
    gtLocalizationMap.set(localeStr, gt);
  });
  return gtLocalizationMap;
})();

export const cards = [
  ...["note", "warning"].map((className) => [
    (node, { locale = DEFAULT_LOCALE }) => {
      const defaultLocaleGt = gettextLocalizationMap.get(DEFAULT_LOCALE);
      let currentLocaleGt = gettextLocalizationMap.get(DEFAULT_LOCALE);
      if (gettextLocalizationMap.has(locale)) {
        currentLocaleGt = gettextLocalizationMap.get(locale);
      }
      if (!(node.properties.className || []).some((c) => c == className)) {
        return false;
      }
      if (!node.children || !node.children[0]) {
        return false;
      }
      const [child] = node.children;
      if (!child.children || !child.children[0]) {
        return false;
      }
      const grandChild = child.children[0];
      return (
        grandChild.tagName == "strong" &&
        (toText(grandChild) ==
          currentLocaleGt.gettext("card_" + className + "_label") ||
          toText(grandChild) ==
            defaultLocaleGt.gettext("card_" + className + "_label"))
      );
    },
    (node, t, { locale = DEFAULT_LOCALE }) => {
      let gt = gettextLocalizationMap.get(DEFAULT_LOCALE);
      if (gettextLocalizationMap.has(locale)) {
        gt = gettextLocalizationMap.get(locale);
      }
      return h("blockquote", [
        h("paragraph", [
          h("strong", [h("text", gt.gettext("card_" + className + "_label"))]),
          ...asArray(t(node.children[0].children.slice(1))),
        ]),
        ...asArray(t(node.children.slice(1))),
      ]);
    },
  ]),

  [
    (node) =>
      node.tagName == "div" &&
      (node.properties.className || "").includes("callout"),
    (node, t, { locale = DEFAULT_LOCALE }) => {
      let gt = gettextLocalizationMap.get(DEFAULT_LOCALE);
      if (gettextLocalizationMap.has(locale)) {
        gt = gettextLocalizationMap.get(locale);
      }
      return h("blockquote", [
        h("paragraph", [
          h("strong", [h("text", gt.gettext("card_callout_label"))]),
        ]),
        ...asArray(t(node.children)),
      ]);
    },
  ],
];
