import { FLAW_LEVELS } from "../../libs/constants";
import { Doc } from "../../libs/types";

export function injectSectionFlaws(
  doc: Partial<Doc>,
  flaws: string[],
  options
) {
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
