import { Handler, State } from "mdast-util-to-hast";
import { u } from "unist-builder";

/**
 * Transform a Markdown code block into a <pre>.
 * Adding the highlight tags as classes prefixed by "brush:"
 */
export function code(state: State, node: Node): ReturnType<Handler> {
  const value = "value" in node && node.value ? node.value + "\n" : "";
  const lang =
    "lang" in node && typeof node.lang === "string"
      ? node.lang.replace(/-nolint$/, "")
      : "";
  const meta = "meta" in node && typeof node.meta === "string" ? node.meta : "";
  const metas = meta.split(" ");
  const props: { className?: string | string[] } = {};

  if (lang) {
    props.className = ["brush:", lang.toLowerCase(), ...metas];
  } else if (meta) {
    props.className = metas;
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
