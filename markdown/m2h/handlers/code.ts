import { Handler, State } from "mdast-util-to-hast";
import { u } from "unist-builder";

/**
 * Transform a Markdown code block into a <pre>.
 * Adding the highlight tags as classes prefixed by "brush:"
 */
export function code(state: State, node: any): ReturnType<Handler> {
  const value = node.value ? node.value + "\n" : "";
  const lang = node.lang?.replace(/-nolint$/, "");
  const meta = (node.meta || "").split(" ");
  const props: { className?: string | string[] } = {};

  if (lang) {
    props.className = ["brush:", lang.toLowerCase(), ...meta];
  } else if (node.meta) {
    props.className = meta;
  }

  /*
   * Prism will inject a <code> element so we don't.
   * If we want to change this, uncomment the following code:
   */
  // const code = h(node, "code", props, [u("text", value)]);
  // if (node.meta) {
  //   code.data = { meta: node.meta };
  // }
  // return h(node.position, "pre", props, [code]);

  return {
    type: "element",
    tagName: "pre",
    properties: props,
    children: [u("text", value)],
  };
}
