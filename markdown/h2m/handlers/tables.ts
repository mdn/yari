import { h } from "../h";
import { QueryAndTransform } from "./utils";

export const tables: QueryAndTransform[] = [
  [{ is: "caption" }, (node, t) => t(node)],

  [{ is: "table", canHaveClass: "standard-table" }, "table"],

  [["thead", "tbody"], (node, t) => t(node)],

  ["tr", "tableRow"],

  [["th", "td"], (node, t) => h("tableCell", t(node, { shouldWrap: true }))],
];
