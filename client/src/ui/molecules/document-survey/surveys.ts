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
  src: string | ((doc: Doc) => string);
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
  DE_LOCALE_2024_EVAL = "DE_LOCALE_2024_EVAL",
  FIREFOX_WEB_COMPAT_2023 = "FIREFOX_WEB_COMPAT_2023",
  INTEROP_2023 = "INTEROP_2023",
  WEB_COMPONENTS_2023 = "WEB_COMPONENTS_2023",
  DISCOVERABILITY_2023 = "DISCOVERABILITY_2023",
  WEB_SECURITY_2023 = "WEB_SECURITY_2023",
  DISCOVERABILITY_AUG_2023 = "DISCOVERABILITY_AUG_2023",
  WEB_APP_AUGUST_2024 = "WEB_APP_AUGUST_2024",
}

enum SurveyKey {
  BLOG_FEEDBACK_2023 = "BLOG_FEEDBACK_2023",
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CONTENT_DISCOVERY_2023 = "CONTENT_DISCOVERY_2023",
  CSS_CASCADE_2022_A = "CSS_CASCADE_2022_A",
  CSS_CASCADE_2022_B = "CSS_CASCADE_2022_B",
  DE_LOCALE_2024 = "DE_LOCALE_2024",
  DE_LOCALE_2024_EVAL = "DE_LOCALE_2024_EVAL",
  FIREFOX_WEB_COMPAT_2023 = "FIREFOX_WEB_COMPAT_2023",
  INTEROP_2023_CSS_HTML = "INTEROP_2023_CSS_HTML",
  INTEROP_2023_API_JS = "INTEROP_2023_API_JS",
  WEB_COMPONENTS_2023 = "WEB_COMPONENTS_2023",
  DISCOVERABILITY_2023 = "DISCOVERABILITY_2023",
  WEB_SECURITY_2023 = "WEB_SECURITY_2023",
  DISCOVERABILITY_AUG_2023 = "DISCOVERABILITY_AUG_2023",
  WEB_APP_AUGUST_2024 = "WEB_APP_AUGUST_2024",
}

// When adding a survey, make sure it has this JavaScript action (in Alchemer)
// so the banner is hidden for users who have already submitted it:
// window.parent && window.parent.postMessage("submit", "*");

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.WEB_APP_AUGUST_2024,
    bucket: SurveyBucket.WEB_APP_AUGUST_2024,
    show: (doc: Doc) => /en-US\/docs\/Web(\/|$)/i.test(doc.mdn_url),
    src: "https://survey.alchemer.com/s3/7942186/MDN-Web-App-Survey",
    teaser:
      "We're working with our partners to learn how developers are building web apps. Share your thoughts and experience in this short survey:",
    question:
      "In the past year, have you built an installable web application?",
    ...survey_duration(SurveyBucket.WEB_APP_AUGUST_2024),
    ...survey_rates(SurveyKey.WEB_APP_AUGUST_2024),
  },
  {
    key: SurveyKey.DE_LOCALE_2024_EVAL,
    bucket: SurveyBucket.DE_LOCALE_2024_EVAL,
    show: (doc: Doc) => /de(\/|$)/i.test(doc.mdn_url),
    src: (doc: Doc) => {
      const url = new URL(
        "https://survey.alchemer.com/s3/8073795/Feedback-zur-deutschen-Version-von-MDN"
      );
      url.searchParams.set("referrer", doc.mdn_url);
      return url.toString();
    },
    teaser:
      "Wir arbeiten daran, die deutsche Übersetzung von MDN zu verbessern.",
    question: "Hätten Sie 2 Minuten, um uns 4 Fragen zu beantworten?",
    rateFrom: 0,
    rateTill: 1,
    start: 0,
    end: Infinity,
  },
];
