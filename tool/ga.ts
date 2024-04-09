import fs from "node:fs";
import {
  BUILD_OUT_ROOT,
  GOOGLE_ANALYTICS_MEASUREMENT_ID,
} from "../libs/env/index.js";
import path from "node:path";

async function main() {
  const measurementId = GOOGLE_ANALYTICS_MEASUREMENT_ID;
  const outFile = path.join(BUILD_OUT_ROOT, "static", "js", "gtag.js");
  const measurementIds = measurementId.split(",").filter(Boolean);
  if (measurementIds.length) {
    const dntHelperCode = fs
      .readFileSync(
        new URL("mozilla.dnthelper.min.js", import.meta.url),
        "utf-8"
      )
      .trim();

    const firstMeasurementId = measurementIds.at(0);
    const gaScriptURL = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(firstMeasurementId)}`;

    const code = `
// Mozilla DNT Helper
${dntHelperCode}
// Load GA unless DNT is enabled.
if (Mozilla && !Mozilla.dntEnabled()) {
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  ${measurementIds
    .map((id) => `gtag('config', '${id}', { 'anonymize_ip': true });`)
    .join("\n  ")}

  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = '${gaScriptURL}';
  document.head.appendChild(gaScript);
}`.trim();
    fs.writeFileSync(outFile, `${code}\n`, "utf-8");
    console.log(
      `Generated ${outFile} for SSR rendering using ${measurementId}.`
    );
  } else {
    console.log("No Google Analytics code file generated");
  }
}
main();
