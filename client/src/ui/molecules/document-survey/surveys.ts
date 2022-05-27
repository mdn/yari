import { Doc } from "../../../document/types";

export interface Survey {
  key: string;
  show: (doc: Doc) => boolean;
  rate: number;
  src: string;
  teaser: string;
  question: string;
}

export const SURVEYS: Survey[] = [
  {
    key: "css_cascade_2022",
    show: (doc: Doc) =>
      /CSS/i.test(
        doc.mdn_url
      ) /* && startTime <= Date.now() && Date.now() <= endTime */,
    rate: 1 /* 0.05 */,
    src: "https://www.surveygizmo.com/s3/6818801/MDN-Short-survey-CSS-Cascade-Layers",
    teaser:
      "Shape the future of the web by taking a 1-2 questions micro survey:",
    question: "What's your experience with Cascade Layers?",
  },
];
