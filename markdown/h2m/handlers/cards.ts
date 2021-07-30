import * as Gettext from "node-gettext";
import * as fs from "fs";
import * as path from "path";
import { h } from "../h";
import { asArray } from "../utils";
import { toText } from "./to-text";
import { QueryAndTransform } from "./utils";

const defaultLocale = "en-US";

const gettextLocalizationMap = (function initLocalizationsMap() {
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

export const cards: QueryAndTransform[] = [
  ...["note", "warning"].map(
    (className) =>
      [
        (node, opts) => {
          const locale = opts.locale || defaultLocale;
          const gt = gettextLocalizationMap.get(locale);
          if (
            !((node.properties.className as string[]) || []).some(
              (c) => c == className
            )
          ) {
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
            toText(grandChild) == gt.gettext("card_" + className + "_label")
          );
        },
        (node, t, opts) => {
          const locale = opts.locale || defaultLocale;
          const gt = gettextLocalizationMap.get(locale);
          return h("blockquote", [
            h("paragraph", [
              h("strong", [
                h("text", gt.gettext("card_" + className + "_label")),
              ]),
              ...asArray(t((node.children[0].children as any).slice(1))),
            ]),
            ...asArray(t(node.children.slice(1))),
          ]);
        },
      ] as QueryAndTransform
  ),

  [
    (node) =>
      node.tagName == "div" &&
      ((node.properties.className as string[]) || "").includes("callout") &&
      node.children[0].tagName == "h4",
    (node, t, opts) => {
      const locale = opts.locale || defaultLocale;
      const gt = gettextLocalizationMap.get(locale);
      return h("blockquote", [
        h("paragraph", [
          h("strong", [h("text", gt.gettext("card_callout_label"))]),
          h("text", " "),
          h("strong", [h("text", toText(node.children[0]))]),
        ]),
        ...asArray(t(node.children.slice(1) as any)),
      ]);
    },
  ],
];
