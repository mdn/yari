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
  CONTENT_DISCOVERY_2023 = "CONTENT_DISCOVERY_2023",
  CSS_CASCADE_2022 = "CSS_CASCADE_2022",
  FIREFOX_WEB_COMPAT_2023 = "FIREFOX_WEB_COMPAT_2023",
  INTEROP_2023 = "INTEROP_2023",
  WEB_COMPONENTS_2023 = "WEB_COMPONENTS_2023",
  DISCOVERABILITY_2023 = "DISCOVERABILITY_2023",
}

enum SurveyKey {
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CONTENT_DISCOVERY_2023 = "CONTENT_DISCOVERY_2023",
  CSS_CASCADE_2022_A = "CSS_CASCADE_2022_A",
  CSS_CASCADE_2022_B = "CSS_CASCADE_2022_B",
  FIREFOX_WEB_COMPAT_2023 = "FIREFOX_WEB_COMPAT_2023",
  INTEROP_2023_CSS_HTML = "INTEROP_2023_CSS_HTML",
  INTEROP_2023_API_JS = "INTEROP_2023_API_JS",
  WEB_COMPONENTS_2023 = "WEB_COMPONENTS_2023",
  DISCOVERABILITY_2023 = "DISCOVERABILITY_2023",
}

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.DISCOVERABILITY_2023,
    bucket: SurveyBucket.DISCOVERABILITY_2023,
    show: (doc: Doc) => /en-US\/docs\/(Web|Learn)(\/|$)/i.test(doc.mdn_url),
    src: "https://survey.alchemer.com/s3/7312179/MDN-Discoverability-User-Satisfaction",
    teaser:
      "At MDN, we are committed to improving the user experience on our website. To ensure that we are meeting this goal, we would like to hear your thoughts and feedback regarding your experience on MDN.",
    question: "What’s your experience on MDN Web Docs?",
    ...survey_duration(SurveyBucket.DISCOVERABILITY_2023),
    ...survey_rates(SurveyKey.DISCOVERABILITY_2023),
  },
];
