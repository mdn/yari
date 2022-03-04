// Copied from https://github.com/syntax-tree/unist-util-position, because we don't support ES modules yet.
// License: MIT
// Copyright (c) 2015 Titus Wormer <tituswormer@gmail.com>

const pointStart = point("start");
const pointEnd = point("end");

/**
 * Get the positional info of `node`.
 *
 * @param {NodeLike} [node]
 * @returns {Position}
 */
function position(node) {
  return { start: pointStart(node), end: pointEnd(node) };
}

/**
 * Get the positional info of `node`.
 *
 * @param {'start'|'end'} type
 */
function point(type) {
  return point;

  /**
   * Get the positional info of `node`.
   *
   * @param {NodeLike} [node]
   * @returns {Point}
   */
  function point(node) {
    /** @type {Point} */
    // @ts-expect-error looks like a point
    const point = (node && node.position && node.position[type]) || {};

    return {
      line: point.line || null,
      column: point.column || null,
      offset: point.offset > -1 ? point.offset : null,
    };
  }
}

module.exports = { position, pointStart, pointEnd };
