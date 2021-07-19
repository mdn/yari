import { h } from "../h";
import { asArray } from "../utils";
import { toText } from "./to-text";
import { QueryAndTransform } from "./utils";

export const cards: QueryAndTransform[] = [
  ...["note", "warning"].map(
    (className) =>
      [
        (node) => {
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
            toText(grandChild).toLowerCase() == className + ":"
          );
        },
        (node, t) =>
          h("blockquote", [
            h("paragraph", [
              h("strong", [
                h(
                  "text",
                  className[0].toUpperCase() + className.slice(1) + ":"
                ),
              ]),
              ...asArray(t((node.children[0].children as any).slice(1))),
            ]),
            ...asArray(t(node.children.slice(1))),
          ]),
      ] as QueryAndTransform
  ),

  [
    (node) =>
      node.tagName == "div" &&
      ((node.properties.className as string[]) || "").includes("callout") &&
      node.children[0].tagName == "h4",
    (node, t) =>
      h("blockquote", [
        h("paragraph", [
          h("strong", [h("text", "Callout:")]),
          h("text", " "),
          h("strong", [h("text", toText(node.children[0]))]),
        ]),
        ...asArray(t(node.children.slice(1) as any)),
      ]),
  ],
];
