import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { CSP_SCRIPT_SRC_VALUES } from "../../libs/constants/index.js";

describe("Content-Security-Policy", () => {
  test('All inline <script> tags must have a corresponding "script-src" CSP entry.', () => {
    function cspValueOf(content: string) {
      const algo = "sha256";
      const hash = crypto.createHash(algo).update(content).digest("base64");
      return `'${algo}-${hash}'`;
    }

    const indexHtmlPath = path.join("client", "build", "index.html");
    const indexHtmlContent = fs.readFileSync(indexHtmlPath).toString();

    const inlineScriptMatches = [
      ...indexHtmlContent.matchAll(/(<script.*?>)(.*?)(<\/script>)/gi),
    ];

    const inlineScriptContents = inlineScriptMatches
      .filter((match) => !match[1].includes("src="))
      .map((match) => match[2]);

    // If this assertion fails, an inline script was added to `ssr/render.tsx`.
    // Please consider merging it with the other inline script, or increment this number.
    expect(inlineScriptContents).toHaveLength(1);

    const inlineScriptCspValues = inlineScriptContents.map(cspValueOf);

    const missingInlineScriptCspValues = inlineScriptCspValues.filter(
      (value) => !CSP_SCRIPT_SRC_VALUES.includes(value)
    );

    // If this assertion fails, an inline script in `ssr/render.tsx` was
    // updated without updating the "script-src" CSP entry in `libs/constants/index.js`.
    expect(missingInlineScriptCspValues).toHaveLength(0);
  });
});
