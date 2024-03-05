import path from "node:path";

import { fdir, PathsOutput } from "fdir";

import { HTML_FILENAME, MARKDOWN_FILENAME } from "../libs/constants/index.js";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env/index.js";

type Tree = { [key: string]: Tree | null };

function allDocumentPathsAsTree(root: string) {
  const api = new fdir()
    .withErrors()
    .withRelativePaths()
    .filter((filePath) => {
      return (
        filePath.endsWith(HTML_FILENAME) || filePath.endsWith(MARKDOWN_FILENAME)
      );
    })
    .crawl(root);

  let tree: Tree = {};
  for (const p of api.sync() as PathsOutput) {
    tree = addToTree(tree, p.split(path.sep));
  }

  return tree;
}

function addToTree(tree: Tree = {}, [current, ...rest]: string[]) {
  if (rest.length === 0) {
    tree[current] = null;
    return tree;
  }

  tree[current] = addToTree(tree[current], rest);
  return tree;
}

function flattenSubTree(
  t: Tree,
  prefix: string[] = [],
  recurse = false
): string[] {
  const directChildren = [...Object.keys(t)]
    .filter(
      (k) =>
        ![HTML_FILENAME, MARKDOWN_FILENAME].includes(k) &&
        (t[k][HTML_FILENAME] === null || t[k][MARKDOWN_FILENAME] === null)
    )
    .map((k) =>
      [
        ...prefix,
        k,
        t[k][MARKDOWN_FILENAME] === null ? MARKDOWN_FILENAME : HTML_FILENAME,
      ].join("/")
    );

  if (!recurse) {
    return directChildren;
  }

  const recursiveChildren = [...Object.entries(t)]
    .filter(([, v]) => v !== null)
    .flatMap(([k, v]) => flattenSubTree(v, [...prefix, k], recurse));

  return [...directChildren, ...recursiveChildren];
}

function childrenForPath(
  tree: Tree,
  [current, ...path]: string[],
  recurse = false,
  prefix: string[] = []
): string[] {
  if (!current) {
    return flattenSubTree(tree, prefix, recurse);
  }

  const child = tree[current];
  if (!child) {
    return [];
  }

  return childrenForPath(child, path, recurse, [...prefix, current]);
}

function initAllDocumentsPathsTree(): Tree {
  // When running a production build we can afford to look up all files upfront.
  if (process.env.NODE_ENV === "production") {
    return {
      [CONTENT_ROOT]: allDocumentPathsAsTree(CONTENT_ROOT),
      [CONTENT_TRANSLATED_ROOT]: CONTENT_TRANSLATED_ROOT
        ? allDocumentPathsAsTree(CONTENT_TRANSLATED_ROOT)
        : {},
    };
  }

  return {};
}

const ALL_DOCUMENT_PATHS_TREE = initAllDocumentsPathsTree();

export function childrenFoldersForPath(
  root: string,
  folder: string,
  recursive: boolean
) {
  const base = path.join(root, folder);
  const baseHTML = path.join(base, HTML_FILENAME);
  const baseMarkdown = path.join(base, MARKDOWN_FILENAME);

  if (process.env.NODE_ENV === "production") {
    // When running a production build we use our lookup.
    const childPaths = childrenForPath(
      ALL_DOCUMENT_PATHS_TREE[root],
      folder.split(path.sep),
      recursive
    );

    return childPaths.map((childFilePath) => path.dirname(childFilePath));
  } else {
    const api = new fdir()
      .withFullPaths()
      .withErrors()
      .filter((filePath) => {
        return (
          (filePath.endsWith(HTML_FILENAME) && !(filePath === baseHTML)) ||
          (filePath.endsWith(MARKDOWN_FILENAME) && !(filePath === baseMarkdown))
        );
      })
      .withMaxDepth(recursive ? Infinity : 1)
      .crawl(base);

    return (api.sync() as PathsOutput).map((childFilePath) =>
      path.relative(root, path.dirname(childFilePath))
    );
  }
}
