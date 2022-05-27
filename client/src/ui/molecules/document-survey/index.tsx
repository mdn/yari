import React from "react";
import { Doc } from "../../../document/types";

const SURVEYS = {
  cssCascade2022: {
    filter: (doc: Doc) => /CSS/i.test(doc.mdn_url),
    rate: 1,
    src: "https://www.surveygizmo.com/s3/6818801/MDN-Short-survey-CSS-Cascade-Layers",
    teaser: "Shape the future of the web by taking a 2 questions micro survey:",
    question: "Have you heard of CSS Cascade Layers?",
  },
};

export function DocumentSurvey({ doc }: { doc: Doc }) {
  const [isOpen, setOpen] = React.useState(false);

  if (!("localStorage" in window)) {
    return <></>;
  }

  for (const [surveyKey, survey] of Object.entries(SURVEYS)) {
    if (!survey.filter(doc)) {
      continue;
    }

    const storageKey = `DocumentSurvey[${surveyKey}]`;
    const random = localStorage.getItem(storageKey) ?? Math.random();
    localStorage.setItem(storageKey, String(random));

    if (random > survey.rate) {
      continue;
    }

    return (
      <div className="notecard">
        {survey.teaser}
        <div>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              setOpen(!isOpen);
            }}
            title="Open survey"
          >
            {survey.question}
          </a>
        </div>
        {isOpen && (
          <iframe
            title={surveyKey}
            src={survey.src}
            height={500}
            style={{ overflow: "hidden", width: "100%" }}
          ></iframe>
        )}
      </div>
    );
  }

  return <></>;
}
