/**
 * @prettier
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Parser'.
const Parser = require("../src/parser.js");

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Parser", function () {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("input with no macros", () => {
    const input = "<p>This is a test.\n<h1>Hello world!</h1>";
    expect(Parser.parse(input)).toEqual([
      {
        type: "TEXT",
        chars: input,
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("one macro, embedded in text", () => {
    expect(Parser.parse("foo {{bar}}\nbaz")).toEqual([
      {
        type: "TEXT",
        chars: "foo ",
      },
      {
        type: "MACRO",
        name: "bar",
        args: [],
        location: {
          start: { line: 1, column: 5, offset: 4 },
          end: { line: 1, column: 12, offset: 11 },
        },
      },
      {
        type: "TEXT",
        chars: "\nbaz",
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("macro with numeric arguments", () => {
    expect(Parser.parse("{{bar(0,1,2.2)}}")).toEqual([
      {
        type: "MACRO",
        name: "bar",
        args: ["0", "1", "2.2"],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 17, offset: 16 },
        },
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("macro with string arguments", () => {
    expect(Parser.parse("{{bar('zero',\"one\")}}")).toEqual([
      {
        type: "MACRO",
        name: "bar",
        args: ["zero", "one"],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 22, offset: 21 },
        },
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("string arguments can contain parens and braces", () => {
    expect(Parser.parse("{{bar(')}}\"',\"')}}\")}}")).toEqual([
      {
        type: "MACRO",
        name: "bar",
        args: [')}}"', "')}}"],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 23, offset: 22 },
        },
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("whitespace is ignored", () => {
    const input = "{{ \n \t bar('zero', \n\t \"one\" ) \n\t }}";
    expect(Parser.parse(input)).toEqual([
      {
        type: "MACRO",
        name: "bar",
        args: ["zero", "one"],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 4, column: 5, offset: 35 },
        },
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("JSON values are parsed correctly", () => {
    "use strict";
    const input =
      '{{ f({ "a": "x", "b": -1e2, "c": 0.5, "d": [1,2, 3], "e":true, "f":false }) }}';
    expect(Parser.parse(input)).toEqual([
      {
        type: "MACRO",
        name: "f",
        args: [
          {
            a: "x",
            b: -1e2,
            c: 0.5,
            d: [1, 2, 3],
            e: true,
            f: false,
          },
        ],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 79, offset: 78 },
        },
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("JSON parameter should allow a single-item list", () => {
    "use strict";
    const tokens = Parser.parse('{{ f({ "a": ["one"] }) }}');
    expect(tokens).toEqual([
      {
        type: "MACRO",
        name: "f",
        args: [{ a: ["one"] }],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 26, offset: 25 },
        },
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("Invalid JSON should cause a syntax error", () => {
    "use strict";

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("Quotes around property names are required", () => {
      expect(() => {
        Parser.parse("{{ f({ x: 1 }) }}");
      }).toThrow();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("Octal literals are not allowed", () => {
      expect(() => {
        Parser.parse('{{ f({ "x": 01 }) }}');
      }).toThrow();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("Trailing commas are not allowed", () => {
      expect(() => {
        Parser.parse('{{ f({ "x": [1,] }) }}');
      }).toThrow();
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("JSON strings should be able to contain ')'", () => {
    "use strict";
    const tokens = Parser.parse('{{ f({ "a": "f)" }) }}');
    expect(tokens).toEqual([
      {
        type: "MACRO",
        name: "f",
        args: [{ a: "f)" }],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 23, offset: 22 },
        },
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Empty JSON values are allowed", () => {
    "use strict";
    let tokens = Parser.parse("{{ f({}) }}");
    expect(tokens).toEqual([
      {
        type: "MACRO",
        name: "f",
        args: [{}],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 12, offset: 11 },
        },
      },
    ]);

    tokens = Parser.parse('{{ f({ "a": [] }) }}');
    expect(tokens).toEqual([
      {
        type: "MACRO",
        name: "f",
        args: [{ a: [] }],
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: 21, offset: 20 },
        },
      },
    ]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("Escaped unicode codepoints are parsed correctly", () => {
    "use strict";

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("Lowercase", () => {
      expect(Parser.parse('{{ f({ "a": "\\u00f3" }) }}')).toEqual([
        {
          type: "MACRO",
          name: "f",
          args: [{ a: "\u00f3" }],
          location: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 27, offset: 26 },
          },
        },
      ]);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("Uppercase", () => {
      expect(Parser.parse('{{ f({ "a": "\\u00F3" }) }}')).toEqual([
        {
          type: "MACRO",
          name: "f",
          args: [{ a: "\u00f3" }],
          location: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 27, offset: 26 },
          },
        },
      ]);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("Non-hexadecimal characters are not allowed", () => {
      expect(() => {
        Parser.parse('{{ f({ "a": "\\uGHIJ" }) }}');
      }).toThrow();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("Four digits are required", () => {
      expect(() => {
        Parser.parse('{{ f({ "a": "\\uFF" }) }}');
      }).toThrow();
    });
  });
});
