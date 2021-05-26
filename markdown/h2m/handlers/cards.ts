import { asArray, Element, h } from "../utils";
import { toText } from "./to-text";
import { QueryAndTransform } from "./utils";

export default [
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
          h(node, "blockquote", [
            h(node, "paragraph", [
              h(node, "strong", [
                h(
                  node,
                  "text",
                  className[0].toUpperCase() + className.slice(1) + ":"
                ),
              ]),
              ...asArray(t((node.children[0].children as Element[]).slice(1))),
            ]),
            ...asArray(t(node.children.slice(1) as Element[])),
          ]),
      ] as QueryAndTransform
  ),

  [
    (node) =>
      node.tagName == "div" &&
      ((node.properties.className as string[]) || "").includes("callout") &&
      node.children[0].tagName == "h4",
    (node, t) =>
      h(node, "blockquote", [
        h(node, "paragraph", [
          h(node, "strong", [h(node, "text", "Callout:")]),
          h(node, "text", " "),
          h(node, "strong", [h(node, "text", toText(node.children[0]))]),
        ]),
        ...asArray(t(node.children.slice(1) as any)),
      ]),
  ],
] as QueryAndTransform[];
