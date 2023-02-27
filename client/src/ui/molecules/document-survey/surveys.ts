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
}

enum SurveyKey {
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CONTENT_DISCOVERY_2023 = "CONTENT_DISCOVERY_2023",
  CSS_CASCADE_2022_A = "CSS_CASCADE_2022_A",
  CSS_CASCADE_2022_B = "CSS_CASCADE_2022_B",
  FIREFOX_WEB_COMPAT_2023 = "FIREFOX_WEB_COMPAT_2023",
  INTEROP_2023_CSS_HTML = "INTEROP_2023_CSS_HTML",
  INTEROP_2023_API_JS = "INTEROP_2023_API_JS",
}

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.CONTENT_DISCOVERY_2023,
    bucket: SurveyBucket.CONTENT_DISCOVERY_2023,
    show: (doc: Doc) => /en-US\/docs\/Web(\/|$)/i.test(doc.mdn_url),
    src: "https://survey.alchemer.com/s3/7241049/MDN-Web-Docs-Content-Discovery",
    teaser:
      "The MDN Web Docs team wants to know what content you want to see. The survey is a single open-ended question and will help us understand what you're looking for.",
    question: "Help us understand the content you're interested in seeing.",
    ...survey_duration(SurveyBucket.CONTENT_DISCOVERY_2023),
    ...survey_rates(SurveyKey.CONTENT_DISCOVERY_2023),
  },
];
