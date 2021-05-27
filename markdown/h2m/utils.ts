import { Node } from "unist";

export type Options = Partial<{
  shouldWrap: boolean;
  singleLine: boolean;
  summary: string;
}>;

export const asArray = <T>(v: T | T[]) =>
  v ? (Array.isArray(v) ? v : [v]) : [];

export const wrapText = (value, { shouldWrap }: Options) =>
  shouldWrap ? value.replace(/\r?\n|\r/g, " ") : value;

export class UnexpectedNodesError extends Error {
  nodes: Node[];
  constructor(nodes: Node[]) {
    super("unexpected nodes");
    this.nodes = nodes;
  }
}
