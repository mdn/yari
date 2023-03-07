import fs from "node:fs";

import { DEFAULT_LOCALE } from "../../../libs/constants/index.js";
import { code } from "./code.js";
import { asDefinitionList, isDefinitionList } from "./dl.js";
import { one, all, wrap } from "./mdast-util-to-hast-utils.js";

/* A utilitary function which parses a JSON gettext file
  to return a Map with each localized string and its matching ID  */
function getL10nCardMap(locale = DEFAULT_LOCALE) {
  // Test if target localization file exists, if
  // not, fallback on English
  let localeFilePath = new URL(
    `../../localizations/${locale}.json`,
    import.meta.url
  );
  if (!fs.existsSync(localeFilePath)) {
    localeFilePath = new URL(
      `../../localizations/${DEFAULT_LOCALE}.json`,
      import.meta.url
    );
  }
  const listMsgObj = JSON.parse(fs.readFileSync(localeFilePath, "utf8"))[
    "translations"
  ][""];
  const l10nCardMap = new Map();

  Object.keys(listMsgObj).forEach((msgName) => {
    l10nCardMap.set(
      listMsgObj[msgName]["msgstr"][0],
      listMsgObj[msgName]["msgid"]
    );
  });
  return l10nCardMap;
}

function getNotecardType(node, locale) {
  if (!node.children) {
    return null;
  }
  const [child] = node.children;
  if (!child || !child.children) {
    return null;
  }
  const [grandChild] = child.children;
  if (grandChild.type != "strong" || !grandChild.children) {
    return null;
  }

  // E.g. in en-US magicKeyword === Note:
  const magicKeyword = grandChild.children[0].value;
  const l10nCardMap = getL10nCardMap(locale);
  let type;
  if (l10nCardMap.has(magicKeyword)) {
    const msgId = l10nCardMap.get(magicKeyword);
    type = msgId.split("_")[1];
  }
  return type == "warning" || type == "note" || type == "callout" ? type : null;
}

export function buildLocalizedHandlers(locale: string) {
  /* This is only used for the Notecard parsing where the "magit" word depends on the locale */
  return {
    code,

    paragraph(h, node) {
      const [child] = node.children;
      // Check for an unnecessarily nested KS-tag and unnest it
      if (
        node.children.length == 1 &&
        child.type == "text" &&
        child.value.startsWith("{{") &&
        child.value.endsWith("}}")
      ) {
        return one(h, child, node);
      }

      return h(node, "p", all(h, node));
    },

    blockquote(h, node) {
      const type = getNotecardType(node, locale);
      if (type) {
        const isCallout = type == "callout";
        if (isCallout) {
          if (node.children[0].children.length <= 1) {
            node.children.splice(0, 1);
          } else {
            node.children[0].children.splice(0, 1);
          }
        }
        return h(
          node,
          "div",
          { className: isCallout ? [type] : ["notecard", type] },
          wrap(all(h, node), true)
        );
      }
      return h(node, "blockquote", wrap(all(h, node), true));
    },

    list(h, node) {
      if (isDefinitionList(node)) {
        return asDefinitionList(h, node);
      }

      const name = node.ordered ? "ol" : "ul";

      const props: { start?: number } = {};
      if (typeof node.start === "number" && node.start !== 1) {
        props.start = node.start;
      }

      // This removes directly descendent paragraphs
      const items = all(h, node).map((item) => ({
        ...item,
        children: item.children.flatMap((child) =>
          child.tagName == "p" ? child.children : [child]
        ),
      }));

      return h(node, name, props, wrap(items, true));
    },
  };
}
