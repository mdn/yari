import { assert, itMacro, describeMacro } from "./utils.js";

describeMacro("SVGAttr", () => {
  for (const locale of ["en-US", "fr"]) {
    for (const attr of ["min", "max"]) {
      itMacro(`${locale} ${attr} `, (macro) => {
        macro.ctx.env.locale = locale;
        return assert.eventually.equal(
          macro.call(attr),
          `<code><a href="/${locale}/docs/Web/SVG/Attribute/${attr}">${attr}</a></code>`
        );
      });
    }
  }
});
