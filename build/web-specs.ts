import { importJSON } from "./utils.js";

type WebSpecs = WebSpec[];
interface WebSpec {
  url: string;
  seriesComposition: string;
  shortname: string;
  series: {
    shortname: string;
    currentSpecification: string;
    title: string;
    shortTitle: string;
    nightlyUrl: string;
  };
  nightly: {
    url: string;
    status: string;
    sourcePath: string;
    alternateUrls: string[];
    repository: string;
    filename: string;
  };
  organization: string;
  groups: { name: string; url: string }[];
  title: string;
  source: string;
  shortTitle: string;
  categories: string[];
  standing: string;
  tests: { repository: string; testPaths: string[] };
}

let promise: Promise<WebSpecs> | null = null;

export async function getWebSpecs(): Promise<WebSpecs> {
  if (!promise) {
    promise = importJSON<WebSpecs>("web-specs/index.json");
  }

  return promise;
}

export async function getWebSpec(url: string): Promise<WebSpec | undefined> {
  if (!url) {
    return;
  }
  const specs = await getWebSpecs();

  return specs.find(
    (spec) =>
      url.startsWith(spec.url) ||
      url.startsWith(spec.nightly.url) ||
      spec.nightly.alternateUrls.some((s) => url.startsWith(s)) ||
      // When grabbing series nightly, make sure we're grabbing the latest spec version
      (spec.shortname === spec.series.currentSpecification &&
        url.startsWith(spec.series.nightlyUrl))
  );
}
