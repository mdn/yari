import React from "react";
import { Doc } from "../../../document/types";
import { ReactComponent as CloseIcon } from "@mdn/dinocons/general/close.svg";
import "./index.scss";
import { Survey, SURVEYS } from "./surveys";
import { getSurveyState, writeSurveyState } from "./util";

export function DocumentSurvey({ doc }: { doc: Doc }) {
  const surveys = React.useMemo(
    () =>
      SURVEYS.filter((survey) => {
        if (!survey.filter(doc)) {
          return false;
        }

        const state = getSurveyState(survey.key);

        return state.random < survey.rate;
      }),
    [doc]
  );

  return surveys.length > 0 ? <SurveyDisplay survey={surveys[0]} /> : <></>;
}

function SurveyDisplay({ survey }: { survey: Survey }) {
  const details = React.useRef<HTMLDetailsElement | null>(null);

  const [state, setState] = React.useState(() => getSurveyState(survey.key));

  React.useEffect(() => {
    writeSurveyState(survey.key, state);
  }, [state, survey.key]);

  function dismiss() {
    setState({
      ...state,
      dismissed_at: new Date(),
    });
  }

  React.useEffect(() => {
    const { current } = details;
    if (!(current instanceof HTMLDetailsElement)) {
      return;
    }

    function markOpened() {
      setState({
        ...state,
        opened_at: new Date(),
      });
    }

    const listener = () => {
      if (current.open) {
        markOpened();
      }
    };

    current.addEventListener("toggle", listener);

    return () => current.removeEventListener("toggle", listener);
  }, [details, state, survey]);

  if (!survey || !state || state.dismissed_at) {
    return <></>;
  }

  return (
    <div className="notecard document-survey">
      <div className="survey-header">
        <div className="survey-teaser">{survey.teaser}</div>

        <div className="survey-dismiss">
          <button
            type="button"
            aria-label={"Hide this survey"}
            onClick={() => dismiss()}
            title={"Hide this survey"}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
      <details ref={details}>
        <summary>{survey.question}</summary>

        {state.opened_at && (
          <iframe
            title={survey.question}
            src={survey.src}
            height={500}
            style={{ overflow: "hidden", width: "100%" }}
          ></iframe>
        )}
      </details>
    </div>
  );
}
