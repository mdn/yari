import { Doc, BCDSection } from "../../../../../libs/types/document";
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
}

enum SurveyKey {
  BROWSER_SURVEY_OCT_2022 = "BROWSER_SURVEY_OCT_2022",
  CSS_CASCADE_2022_A = "CSS_CASCADE_2022_A",
  CSS_CASCADE_2022_B = "CSS_CASCADE_2022_B",
}

export const SURVEYS: Survey[] = [
  {
    key: SurveyKey.BROWSER_SURVEY_OCT_2022,
    bucket: SurveyBucket.BROWSER_SURVEY_OCT_2022,
    show: (doc: Doc) =>
      doc?.body.some((section) => section.type === "browser_compatibility"),
    src: "https://www.surveygizmo.com/collab/7049440/Short-survey-browsers",
    teaser:
      "What is important to you when deciding which browser features to use? Take our 1 minute survey:",
    question:
      "What's important to you when deciding which browser features to use?",
    ...survey_duration(SurveyBucket.BROWSER_SURVEY_OCT_2022),
    ...survey_rates(SurveyKey.BROWSER_SURVEY_OCT_2022),
  },
];
