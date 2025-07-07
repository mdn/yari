import { ReactNode } from "react";
import { Doc } from "../../../../../libs/types/document";

export interface Survey {
  key: SurveyKey;
  bucket: SurveyBucket;
  show: (doc: Pick<Doc, "mdn_url">) => boolean;
  // Start in milliseconds since 1970.
  start: number;
  // End in milliseconds since 1970.
  end: number;
  // Proportion slice of users to target.
  rateFrom: number;
  rateTill: number;
  src: string | ((doc: Pick<Doc, "mdn_url">) => string);
  teaser: ReactNode;
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
  IT_LOCALE_2025 = "IT_LOCALE_2025",
  WEB_COMPONENTS_2023 = "WEB_COMPONENTS_2023",
  DISCOVERABILITY_2023 = "DISCOVERABILITY_2023",
  WEB_SECURITY_2023 = "WEB_SECURITY_2023",
  DISCOVERABILITY_AUG_2023 = "DISCOVERABILITY_AUG_2023",
  WEB_APP_AUGUST_2024 = "WEB_APP_AUGUST_2024",
  HOMEPAGE_FEEDBACK_2024 = "HOMEPAGE_FEEDBACK_2024",
  WEBDX_EDITING_2024 = "WEBDX_EDITING_2024",
  HOUSE_SURVEY_2025 = "HOUSE_SURVEY_2025",
  JS_PROPOSALS_2025 = "JS_PROPOSALS_2025",
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
  IT_LOCALE_2025 = "IT_LOCALE_2025",
  WEB_COMPONENTS_2023 = "WEB_COMPONENTS_2023",
  DISCOVERABILITY_2023 = "DISCOVERABILITY_2023",
  WEB_SECURITY_2023 = "WEB_SECURITY_2023",
  DISCOVERABILITY_AUG_2023 = "DISCOVERABILITY_AUG_2023",
  WEB_APP_AUGUST_2024 = "WEB_APP_AUGUST_2024",
  HOMEPAGE_FEEDBACK_2024 = "HOMEPAGE_FEEDBACK_2024",
  WEBDX_EDITING_2024 = "WEBDX_EDITING_2024",
  HOUSE_SURVEY_2025 = "HOUSE_SURVEY_2025",
  JS_PROPOSALS_2025 = "JS_PROPOSALS_2025",
}

// When adding a survey, make sure it has this JavaScript action (in Alchemer)
// so the banner is hidden for users who have already submitted it:
// window.parent && window.parent.postMessage("submit", "*");

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.DE_LOCALE_2024_EVAL,
    bucket: SurveyBucket.DE_LOCALE_2024_EVAL,
    show: (doc: Pick<Doc, "mdn_url">) => {
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
    src: (doc: Pick<Doc, "mdn_url">) => {
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
];
