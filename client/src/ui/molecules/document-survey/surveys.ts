import { Doc } from "../../../document/types";
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
  CSS_CASCADE_2022 = "CSS_CASCADE_2022",
}

enum SurveyKey {
  CSS_CASCADE_2022_A = "CSS_CASCADE_2022_A",
  CSS_CASCADE_2022_B = "CSS_CASCADE_2022_B",
}

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.CSS_CASCADE_2022_B,
    bucket: SurveyBucket.CSS_CASCADE_2022,
    show: (doc: Doc) =>
      /en-US\/docs\/(Learn|Web)\/CSS(\/|$)/i.test(doc.mdn_url),
    src: "https://www.surveygizmo.com/s3/6818801/MDN-Short-survey-CSS-Cascade-Layers",
    teaser:
      "Shape the future of the web by taking a 1-2 questions micro survey:",
    question: "What's your experience with Cascade Layers?",
    ...survey_duration(SurveyBucket.CSS_CASCADE_2022),
    ...survey_rates(SurveyKey.CSS_CASCADE_2022_B),
  },
  {
    key: SurveyKey.CSS_CASCADE_2022_A,
    bucket: SurveyBucket.CSS_CASCADE_2022,
    show: (doc: Doc) =>
      /en-US\/docs\/(Learn|Web)\/CSS(\/|$)/i.test(doc.mdn_url),
    src: "https://www.surveygizmo.com/s3/6898398/CSS-Cascade-Layers-A",
    teaser:
      "Shape the future of the web by taking a 1-2 questions micro survey:",
    question: "What's your experience with Cascade Layers?",
    ...survey_duration(SurveyBucket.CSS_CASCADE_2022),
    ...survey_rates(SurveyKey.CSS_CASCADE_2022_A),
  },
];
