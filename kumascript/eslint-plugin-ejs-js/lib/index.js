/* --------------------
 * eslint-plugin-ejs-js module
 * ------------------*/

"use strict";

/*
 * Parser classes
 */
class Block {
  constructor(line, col, print, precedingText) {
    this.line = line;
    this.col = col;
    this.endLine = null;
    this.endCol = null;

    this.outLine = null;
    this.outCol = null;
    this.outEndLine = null;
    this.outEndCol = null;

    this.print = print || false;
    this.preChars = (print ? 6 : 0) + (precedingText ? 8 : 0);
    this.postChars = print ? 2 : 0;
    this.precedingText = precedingText || false;

    this.text = undefined;
    this.texts = [];
  }

  add(text) {
    this.texts.push(text.replace(/await/, ""));
  }

  addFinal(thisText, endLine, endCol) {
    this.add(thisText);

    let text = this.texts.join("\n");
    if (this.print) text = `print(${text});`;
    if (this.precedingText) text = `print();${text}`;
    this.text = text;

    this.endLine = endLine;
    this.endCol = endCol;
  }
}

class Parser {
  constructor(text) {
    this.text = text;
    this.lines = text.split(/\r?\n/);
    this.lineNum = null;
    this.outLineNum = 2;
    this.outCol = 1;
    this.blocks = [];
    this.block = null;
    this.precedingText = false;
    this.line = null;
  }

  parse() {
    for (let i = 0; i < this.lines.length; i++) {
      this.parseLine(i);
    }

    // If open block, error
    const { block, blocks } = this;
    if (block)
      throw new Error(
        `Closing tag not found for block starting at line ${block.line}, column ${block.col}`
      );

    return `/* eslint-disable no-undef */\n${blocks
      .map((block) => block.text)
      .join("")}`;
  }

  parseLine(index) {
    this.lineNum = index + 1;
    this.line = this.lines[index];
    this.lastCol = 0;

    if (this.block) {
      // Block open
      this.processEnd();
    } else {
      this.processStart();
    }
  }

  processStart() {
    // Find start of block (skip over `<%%` and `<%#`)
    const { line } = this;
    let start = regexIndexOf(line, /<%([^%#]|$)/, this.lastCol);
    if (start == -1) {
      // No block on this line
      this.precedingText = true;
      return;
    }

    if (start != this.lastCol) this.precedingText = true;

    // Identify if a start modifier
    // TODO Support `<%#` and `<%%`
    let print = false;
    let endTag = start + 2;
    const char = line.slice(endTag, endTag + 1);
    if (["_", "=", "-"].includes(char)) {
      endTag++;
      if (char != "_") print = true;
    }

    // Trim whitespace off start
    let startText = regexIndexOf(line, /\S/, endTag);
    if (startText == -1) startText = endTag;

    // Record block
    const block = new Block(
      this.lineNum,
      startText + 1,
      print,
      this.precedingText
    );
    block.outLine = this.outLineNum;
    block.outCol = this.outCol + block.preChars;
    this.block = block;
    this.lastCol = startText;

    // Find end of block
    this.processEnd();
  }

  processEnd() {
    // Find end of block
    const { line, lastCol, block } = this;
    const end = line.indexOf("%>", lastCol);
    if (end == -1) {
      // End not found - add rest of line to block
      block.add(line.slice(lastCol));
      this.outLineNum++;
      this.outCol = 1;
      return;
    }

    // End found
    // Remove end modifiers
    let blockText = line.slice(lastCol, end);
    let endText = end;
    if (["-", "_"].includes(blockText.slice(-1))) {
      endText--;
      blockText = blockText.slice(0, -1);
    }

    // Trim white space from end
    if (lastCol != 0) {
      const match = blockText.match(/\s+$/);
      if (match) {
        const chars = match[0].length;
        blockText = blockText.slice(0, -chars);
        endText -= chars;
      }
    }

    // Close block
    block.addFinal(blockText, this.lineNum, endText + 1);
    this.addBlock(block);
    this.lastCol = end + 2;
    this.precedingText = false;

    // Find next block
    this.processStart();
  }

  addBlock(block) {
    block.outEndLine = this.outLineNum;

    const blockLines = block.texts.length;
    const outEndCol =
      block.texts[blockLines - 1].length + (blockLines == 1 ? block.outCol : 1);
    this.outCol = outEndCol + block.postChars;
    block.outEndCol = outEndCol;

    this.blocks.push(block);
    this.block = null;
  }
}

/*
 * Processor
 */

let blocks;

function preprocess(text) {
  const parser = new Parser(text);
  const out = parser.parse();
  blocks = parser.blocks;
  return [out];
}

function postprocess(messages) {
  messages = messages[0];

  if (!messages.length) return [];

  for (let message of messages) {
    const { line, column: col } = message;
    const block = blocks.find((block) => {
      if (line < block.outLine) return false;
      if (line > block.outEndLine) return false;
      if (line == block.outLine && col < block.outCol) return false;
      if (line == block.outEndLine && col > block.outEndCol) return false;
      return true;
    });

    if (!block) throw new Error("Could not find matching block");

    if (line == block.outLine) {
      message.line = block.line;
      message.column += block.col - block.outCol;
    } else {
      message.line += block.line - block.outLine;
    }
  }

  return messages;
}

module.exports.processors = {
  ".ejs": {
    preprocess,
    postprocess,
  },
};

/*
 * Utiilty functions
 */

function regexIndexOf(str, regex, pos) {
  if (pos == null) pos = 0;
  const indexOf = str.substring(pos).search(regex);
  return indexOf == -1 ? -1 : pos + indexOf;
}
