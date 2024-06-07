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
  footnote?: string;
}

enum SurveyBucket {
  BLOG_FEEDBACK_2023 = "BLOG_FEEDBACK_2023",
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CONTENT_DISCOVERY_2023 = "CONTENT_DISCOVERY_2023",
  CSS_CASCADE_2022 = "CSS_CASCADE_2022",
  DE_LOCALE_2024 = "DE_LOCALE_2024",
  FIREFOX_WEB_COMPAT_2023 = "FIREFOX_WEB_COMPAT_2023",
  INTEROP_2023 = "INTEROP_2023",
  WEB_COMPONENTS_2023 = "WEB_COMPONENTS_2023",
  DISCOVERABILITY_2023 = "DISCOVERABILITY_2023",
  WEB_SECURITY_2023 = "WEB_SECURITY_2023",
  DISCOVERABILITY_AUG_2023 = "DISCOVERABILITY_AUG_2023",
}

enum SurveyKey {
  BLOG_FEEDBACK_2023 = "BLOG_FEEDBACK_2023",
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CONTENT_DISCOVERY_2023 = "CONTENT_DISCOVERY_2023",
  CSS_CASCADE_2022_A = "CSS_CASCADE_2022_A",
  CSS_CASCADE_2022_B = "CSS_CASCADE_2022_B",
  DE_LOCALE_2024 = "DE_LOCALE_2024",
  FIREFOX_WEB_COMPAT_2023 = "FIREFOX_WEB_COMPAT_2023",
  INTEROP_2023_CSS_HTML = "INTEROP_2023_CSS_HTML",
  INTEROP_2023_API_JS = "INTEROP_2023_API_JS",
  WEB_COMPONENTS_2023 = "WEB_COMPONENTS_2023",
  DISCOVERABILITY_2023 = "DISCOVERABILITY_2023",
  WEB_SECURITY_2023 = "WEB_SECURITY_2023",
  DISCOVERABILITY_AUG_2023 = "DISCOVERABILITY_AUG_2023",
}

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.DE_LOCALE_2024,
    bucket: SurveyBucket.DE_LOCALE_2024,
    show: () => (navigator?.language || "").startsWith("de"),
    src: "https://survey.alchemer.com/s3/7881145/MDN-German-Locale-Survey",
    teaser: "Was wäre, wenn MDN auf Deutsch übersetzt wäre?",
    question: "Welche Sprache würdest du dann bevorzugen?",
    footnote:
      "You're seeing this survey, because your browser indicates German as your preferred language.",
    ...survey_duration(SurveyBucket.DE_LOCALE_2024),
    ...survey_rates(SurveyKey.DE_LOCALE_2024),
  },
];
