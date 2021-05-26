import type { Node } from "unist";

import { Element, Options } from "../utils";

type Query =
  | string
  | string[]
  | Partial<{
      is: string | string[];
      hasClass: string | string[];
      canHaveClass: string | string[];
    }>
  | ((node: Element) => boolean);

type Transform = (
  node: Element,
  t: (node: Element | Element[], subOptions?: Options) => Node | Node[],
  options: Options
) => null | Node | Node[];

export type QueryAndTransform = readonly [Query, Transform];
