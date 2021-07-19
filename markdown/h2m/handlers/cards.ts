import * as Gettext from "node-gettext";
import { h } from "../h";
import { asArray } from "../utils";
import { toText } from "./to-text";
import { QueryAndTransform } from "./utils";

const getTextDefaultDomainName = "messages";

function initLocalizations(locale) {
  const translations = require("../../localizations/" + locale + ".json");
  const gt = new Gettext();
  gt.addTranslations(locale, getTextDefaultDomainName, translations);
  gt.setLocale(locale);
  return gt;
}

export const cards: QueryAndTransform[] = [
  ...["note", "warning"].map(
    (className) =>
      [
        (node, opts) => {
          const locale = opts.locale;
          const gt = initLocalizations(locale);
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
          const locale = opts.locale;
          const gt = initLocalizations(locale);
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
      const locale = opts.locale;
      const gt = initLocalizations(locale);
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
