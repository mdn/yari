import { Doc } from "../../../document/types";
import { SURVEY_END, SURVEY_RATE, SURVEY_START } from "../../../env";

export interface Survey {
  key: SurveyKey;
  show: (doc: Doc) => boolean;
  // Start in milliseconds since 1970.
  start: number;
  // End in milliseconds since 1970.
  end: number;
  // Proportion of users to target.
  rate: number;
  src: string;
  teaser: string;
  question: string;
}

enum SurveyKey {
  CSS_CASCADE_2022 = "css_cascade_2022",
}

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.CSS_CASCADE_2022,
    show: (doc: Doc) =>
      /en-US\/docs\/(Learn|Web)\/CSS(\/|$)/i.test(doc.mdn_url),
    rate: SURVEY_RATE,
    start: SURVEY_START,
    end: SURVEY_END,
    src: "https://www.surveygizmo.com/s3/6818801/MDN-Short-survey-CSS-Cascade-Layers",
    teaser:
      "Shape the future of the web by taking a 1-2 questions micro survey:",
    question: "What's your experience with Cascade Layers?",
  },
];
