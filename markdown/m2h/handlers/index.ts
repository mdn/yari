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
      listMsgObj[msgName]["msgid"],
      listMsgObj[msgName]["msgstr"][0]
    );
  });
  return l10nCardMap;
}

function getNotecardType(node, locale) {
  const types = ["note", "warning", "callout"];
  // The styling and infrastructure is in place to add the following types when ready:
  // const types = ["note", "tip", "important", "warning", "caution", "callout"];

  if (!node.children) {
    return null;
  }
  const [child] = node.children;
  if (!child?.children) {
    return null;
  }
  const [grandChild] = child.children;

  const l10nCardMap = getL10nCardMap(locale);

  // GFM proposed notecard syntax -- https://github.com/orgs/community/discussions/16925
  if (grandChild.type === "text") {
    const firstLine = grandChild.value.split("\n")[0];
    const match = firstLine.match(
      new RegExp(`\\[!(${types.map((t) => t.toUpperCase()).join("|")})\\]`)
    );
    if (match) {
      const type = match[1].toLowerCase();
      const magicKeyword = l10nCardMap.get(`card_${type}_label`);
      return { type, isGFM: true, magicKeyword };
    }
  }

  if (grandChild.type === "strong" && grandChild.children) {
    // E.g. in en-US magicKeyword === Note:
    const magicKeyword = grandChild.children[0].value;

    for (const entry of l10nCardMap.entries()) {
      if (entry[1] === magicKeyword) {
        const type = entry[0].split("_")[1];
        return types.includes(type)
          ? { type, isGFM: false, magicKeyword }
          : null;
      }
    }
  }

  return null;
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
        const isCallout = type.type == "callout";

        if (type.isGFM) {
          // Handle GFM proposed syntax
          node.children[0].children[0].value =
            node.children[0].children[0].value.replace(/\[!\w+\]\n/, "");

          // If the type isn't a callout, add the magic keyword
          if (!isCallout) {
            node.children[0].children.unshift({
              type: "strong",
              children: [
                {
                  type: "text",
                  value: type.magicKeyword,
                },
              ],
            });
            node.children[0].children[1].value =
              " " + node.children[0].children[1].value;
          }
        } else {
          // Remove "Callout:" text
          if (isCallout) {
            if (node.children[0].children.length <= 1) {
              node.children.splice(0, 1);
            } else {
              node.children[0].children.splice(0, 1);
            }
          }
        }

        return {
          type: "element",
          tagName: "div",
          properties: {
            className: isCallout ? [type.type] : ["notecard", type.type],
          },
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
