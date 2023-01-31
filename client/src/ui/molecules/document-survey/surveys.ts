import { Doc } from "../../../../../libs/types/document";
import { survey_duration, survey_rates } from "../../../env";

export interface Survey {
  key: SurveyKey;
  bucket: SurveyBucket;
  show: (doc: Doc) => boolean;
  // Start in milliseconds since 1970.
  start: number;
  // End in milliseconds since 1970.
  end: number;
  // Proportion slice of users to target.
  rateFrom: number;
  rateTill: number;
  src: string;
  teaser: string;
  question: string;
}

enum SurveyBucket {
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CSS_CASCADE_2022 = "CSS_CASCADE_2022",
  FIREFOX_WEB_COMPAT_2023 = "FIREFOX_WEB_COMPAT_2023",
  INTEROP_2023 = "INTEROP_2023",
}

enum SurveyKey {
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CSS_CASCADE_2022_A = "CSS_CASCADE_2022_A",
  CSS_CASCADE_2022_B = "CSS_CASCADE_2022_B",
  FIREFOX_WEB_COMPAT = "FIREFOX_WEB_COMPAT",
  INTEROP_2023_CSS_HTML = "INTEROP_2023_CSS_HTML",
  INTEROP_2023_API_JS = "INTEROP_2023_API_JS",
}

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.FIREFOX_WEB_COMPAT,
    bucket: SurveyBucket.FIREFOX_WEB_COMPAT,
    show: (doc: Doc) =>
      /en-US\/docs\/Web\/(JavaScript|API)(\/|$)/i.test(doc.mdn_url),
    src: "https://survey.alchemer.com/s3/7195211/Help-prioritize-cross-browser-web-platform-features",
    teaser:
      "Ensuring the web is open and accessible to all is central to Mozilla’s mission. The Firefox product team is interested in learning which features are most important to support across all major browsers.",
    question: "Let us know what you think.",
    ...survey_duration(SurveyBucket.FIREFOX_WEB_COMPAT),
    ...survey_rates(SurveyKey.FIREFOX_WEB_COMPAT),
  },
];
