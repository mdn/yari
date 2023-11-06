import fs from "node:fs";

import { DEFAULT_LOCALE } from "../../../libs/constants/index.js";
import { code } from "./code.js";
import { asDefinitionList, isDefinitionList } from "./dl.js";
import { Handler, Handlers, State } from "mdast-util-to-hast";

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

export function buildLocalizedHandlers(locale: string): Handlers {
  /* This is only used for the Notecard parsing where the "magit" word depends on the locale */
  return {
    code,

    paragraph(state: State, node: any): ReturnType<Handler> {
      const [child] = node.children;
      // Check for an unnecessarily nested KS-tag and unnest it
      if (
        node.children.length == 1 &&
        child.type == "text" &&
        child.value.startsWith("{{") &&
        child.value.endsWith("}}")
      ) {
        return state.one(child, node);
      }

      return {
        type: "element",
        tagName: "p",
        properties: {},
        children: state.all(node),
      };
    },

    blockquote(state: State, node: any): ReturnType<Handler> {
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
        return {
          type: "element",
          tagName: "div",
          properties: { className: isCallout ? [type] : ["notecard", type] },
          children: state.wrap(state.all(node), true),
        };
      }
      return {
        type: "element",
        tagName: "blockquote",
        properties: {},
        children: state.wrap(state.all(node), true),
      };
    },

    list(state: State, node: any): ReturnType<Handler> {
      if (isDefinitionList(node)) {
        return asDefinitionList(state, node);
      }

      const name = node.ordered ? "ol" : "ul";

      const props: { start?: number } = {};
      if (typeof node.start === "number" && node.start !== 1) {
        props.start = node.start;
      }

      // This removes directly descendent paragraphs
      const items = state.all(node).map((item) => ({
        ...item,
        children:
          "children" in item
            ? item.children.flatMap((child) =>
                "tagName" in child && child.tagName == "p"
                  ? child.children
                  : [child]
              )
            : [],
      }));

      return {
        type: "element",
        tagName: name,
        properties: props,
        children: state.wrap(items, true),
      };
    },
  };
}
