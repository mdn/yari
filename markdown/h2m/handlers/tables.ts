import { h } from "../h";
import { QueryAndTransform } from "./utils";

export const tables: QueryAndTransform[] = [
  [{ is: "caption" }, (node, t) => t(node)],

  [
    { is: "table", canHaveClass: "standard-table" },
    (node, t) =>
      h(
        "table",
        node.children
          .flatMap((node) =>
            node.type == "element" &&
            typeof node.tagName == "string" &&
            ["thead", "tbody", "tfoot"].includes(node.tagName)
              ? node.children
              : node
          )
          .filter((node) => node.tagName == "tr")
          .flatMap((node, i) => t([node], { rowIndex: i }))
      ),
  ],

  ["tr", "tableRow"],

  [
    ["th", "td"],
    (node, t, { rowIndex }) =>
      (node.tagName == "th" ? rowIndex == 0 : rowIndex > 0)
        ? h("tableCell", t(node, { shouldWrap: true }))
        : null,
  ],
];
