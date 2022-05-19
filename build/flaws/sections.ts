// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'FLAW_LEVEL... Remove this comment to see the full error message
const { FLAW_LEVELS } = require("../constants");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'injectSect... Remove this comment to see the full error message
function injectSectionFlaws(doc, flaws, options) {
  if (!flaws.length) {
    return;
  }

  const level = options.flawLevels.get("sectioning");
  if (level === FLAW_LEVELS.ERROR) {
    throw new Error(flaws.join(" "));
  } else if (level === FLAW_LEVELS.WARN) {
    doc.flaws.sectioning = flaws.map((explanation, i) => {
      const id = `sectioning${i + 1}`;
      return { id, explanation };
    });
  }
}

module.exports = { injectSectionFlaws };
