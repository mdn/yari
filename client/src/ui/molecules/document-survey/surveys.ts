import { survey_duration, survey_rates } from "../../../env";

export interface Survey {
  key: SurveyKey;
  bucket: SurveyBucket;
  show: (doc: { mdn_url: string }) => boolean;
  // Start in milliseconds since 1970.
  start: number;
  // End in milliseconds since 1970.
  end: number;
  // Proportion slice of users to target.
  rateFrom: number;
  rateTill: number;
  src: string | ((doc: { mdn_url: string }) => string);
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
  HOMEPAGE_FEEDBACK_2024 = "HOMEPAGE_FEEDBACK_2024",
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
  HOMEPAGE_FEEDBACK_2024 = "HOMEPAGE_FEEDBACK_2024",
}

// When adding a survey, make sure it has this JavaScript action (in Alchemer)
// so the banner is hidden for users who have already submitted it:
// window.parent && window.parent.postMessage("submit", "*");

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.WEB_APP_AUGUST_2024,
    bucket: SurveyBucket.WEB_APP_AUGUST_2024,
    show: (doc: { mdn_url: string }) =>
      /en-US\/docs\/Web(\/|$)/i.test(doc.mdn_url),
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
    show: (doc: { mdn_url: string }) => {
      if (!doc.mdn_url.startsWith("/de/docs/")) {
        // Exclude other languages.
        return false;
      }

      try {
        // Exclude initial page view.
        const referrer = new URL(document.referrer);
        return referrer.pathname.startsWith("/de/docs/");
      } catch (e) {
        return false;
      }
    },
    src: (doc: { mdn_url: string }) => {
      const url = new URL(
        "https://survey.alchemer.com/s3/8073795/Feedback-zur-deutschen-Version-von-MDN"
      );
      url.searchParams.set("referrer", doc.mdn_url);
      return url.toString();
    },
    teaser: "Diese deutsche Übersetzung von MDN ist Teil eines Experiments.",
    question: "Hätten Sie 2 Minuten, um uns ein paar Fragen zu beantworten?",
    rateFrom: 0,
    rateTill: 1,
    start: 0,
    end: Infinity,
  },
  {
    key: SurveyKey.HOMEPAGE_FEEDBACK_2024,
    bucket: SurveyBucket.HOMEPAGE_FEEDBACK_2024,
    show: (doc: { mdn_url: string }) => /[^/]+\/$/i.test(doc.mdn_url),
    src: "https://survey.alchemer.com/s3/8075407/MDN-Homepage-Improvements",
    teaser: "We are refreshing out homepage and would love",
    question: "your input!",
    ...survey_duration(SurveyBucket.HOMEPAGE_FEEDBACK_2024),
    ...survey_rates(SurveyKey.HOMEPAGE_FEEDBACK_2024),
  },
];
