const path = require("path");

const { fdir } = require("fdir");

const {
  HTML_FILENAME,
  MARKDOWN_FILENAME,
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
} = require("./constants");

function allDocumentPathsAsTree(root) {
  const api = new fdir()
    .withErrors()
    .withRelativePaths()
    .filter((filePath) => {
      return (
        filePath.endsWith(HTML_FILENAME) || filePath.endsWith(MARKDOWN_FILENAME)
      );
    })
    .crawl(root);

  let tree = {};
  for (const p of api.sync()) {
    tree = addToTree(tree, p.split(path.sep));
  }

  return tree;
}

function addToTree(tree = {}, [current, ...rest]) {
  if (rest.length === 0) {
    tree[current] = null;
    return tree;
  }

  tree[current] = addToTree(tree[current], rest);
  return tree;
}

function flattenSubTree(t, prefix = [], recurse = false) {
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
  tree,
  [current, ...path],
  recurse = false,
  prefix = []
) {
  if (!current) {
    return flattenSubTree(tree, prefix, recurse);
  }

  const child = tree[current];
  if (!child) {
    return [];
  }

  return childrenForPath(child, path, recurse, [...prefix, current]);
}

function initAllDocumentsPathsTree() {
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

function childrenFoldersForPath(root, folder, recursive) {
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

    return api
      .sync()
      .map((childFilePath) => path.relative(root, path.dirname(childFilePath)));
  }
}

module.exports = { childrenFoldersForPath };
