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
  INTEROP_2023 = "INTEROP_2023",
}

enum SurveyKey {
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CSS_CASCADE_2022_A = "CSS_CASCADE_2022_A",
  CSS_CASCADE_2022_B = "CSS_CASCADE_2022_B",
  INTEROP_2023_CSS_HTML = "INTEROP_2023_CSS_HTML",
  INTEROP_2023_API_JS = "INTEROP_2023_API_JS",
}

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.INTEROP_2023_CSS_HTML,
    bucket: SurveyBucket.INTEROP_2023,
    show: (doc: Doc) => /en-US\/docs\/Web\/(CSS|HTML)(\/|$)/i.test(doc.mdn_url),
    src: "https://survey.alchemer.com/s3/7081564/MDN-Interop-2023-CSS-HTML",
    teaser:
      "Browser vendors are working together to improve feature support across browsers. Shape the future of the web by taking this 1-question survey!",
    question:
      "Which features should be improved across browsers in the coming year?",
    ...survey_duration(SurveyBucket.INTEROP_2023),
    ...survey_rates(SurveyKey.INTEROP_2023_CSS_HTML),
  },
  {
    key: SurveyKey.INTEROP_2023_API_JS,
    bucket: SurveyBucket.INTEROP_2023,
    show: (doc: Doc) =>
      /en-US\/docs\/Web\/(API|JavaScript)(\/|$)/i.test(doc.mdn_url),
    src: "https://survey.alchemer.com/s3/7081727/MDN-Interop-2023-APIs-JavaScript",
    teaser:
      "Browser vendors are working together to improve feature support across browsers. Shape the future of the web by taking this 1-question survey!",
    question:
      "Which features should be improved across browsers in the coming year?",
    ...survey_duration(SurveyBucket.INTEROP_2023),
    ...survey_rates(SurveyKey.INTEROP_2023_API_JS),
  },
];
