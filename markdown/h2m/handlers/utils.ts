import { Comment, Element, Text } from "hast";
import { MDNodeUnion } from "../h";
import { Options } from "../utils";

export type Query =
  | string
  | [string, string, ...string[]]
  | Partial<{
      is: string | string[];
      has: string | string[];
      canHave: string | string[];
      hasClass: string | string[];
      canHaveClass: string | string[];
    }>
  | ((node: Element) => boolean);

type HTMLNode = Element | Comment | Text;

type Transform =
  | MDNodeUnion["type"]
  | ((
      node: Element,
      t: (node: HTMLNode | HTMLNode[], subOptions?: Options) => MDNodeUnion[],
      options: Options
    ) => null | MDNodeUnion | MDNodeUnion[]);

export type QueryAndTransform = readonly [Query, Transform];
