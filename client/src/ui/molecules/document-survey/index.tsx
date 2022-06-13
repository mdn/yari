import React from "react";
import { Doc } from "../../../document/types";
import "./index.scss";
import { Survey, SURVEYS } from "./surveys";
import { getSurveyState, writeSurveyState } from "./utils";
import { useIsServer } from "../../../hooks";
import { Icon } from "../../atoms/icon";

export function DocumentSurvey({ doc }: { doc: Doc }) {
  const isServer = useIsServer();

  const survey = React.useMemo(
    () =>
      SURVEYS.find((survey) => {
        if (isServer) {
          return false;
        }

        if (!survey.show(doc)) {
          return false;
        }

        const now = Date.now();
        if (now < survey.start || survey.end < now) {
          return false;
        }

        const state = getSurveyState(survey.bucket);

        return (
          state.random >= survey.rateFrom && state.random < survey.rateTill
        );
      }),
    [doc, isServer]
  );

  return survey ? <SurveyDisplay survey={survey} /> : <></>;
}

function SurveyDisplay({ survey }: { survey: Survey }) {
  const details = React.useRef<HTMLDetailsElement | null>(null);

  const [originalState] = React.useState(() => getSurveyState(survey.bucket));
  const [state, setState] = React.useState(() => originalState);

  React.useEffect(() => {
    writeSurveyState(survey.bucket, state);
  }, [state, survey.bucket]);

  function dismiss() {
    setState({
      ...state,
      dismissed_at: Date.now(),
    });
  }

  function submitted() {
    setState({
      ...state,
      submitted_at: Date.now(),
    });
  }

  React.useEffect(() => {
    const { current } = details;
    if (!(current instanceof HTMLDetailsElement)) {
      return;
    }

    const listener = () => {
      if (current.open && !state.opened_at) {
        setState({
          ...state,
          opened_at: Date.now(),
        });
      }
    };

    current.addEventListener("toggle", listener);

    return () => current.removeEventListener("toggle", listener);
  }, [details, state, survey]);

  React.useEffect(() => {
    if (!state.seen_at) {
      setState({
        ...state,
        seen_at: Date.now(),
      });
    }
  }, [state]);

  React.useEffect(() => {
    // For this to work, the Survey needs this JavaScript action:
    // window.parent && window.parent.postMessage("submit", "*");

    const listener = (event: MessageEvent) => {
      if (
        event.origin === "https://www.surveygizmo.com" &&
        event.data === "submit"
      ) {
        submitted();
      }
    };

    window.addEventListener("message", listener, false);

    return () => {
      window.removeEventListener("message", listener, false);
    };
  });

  if (state.dismissed_at || originalState.submitted_at) {
    return <></>;
  }

  return (
    <div className="document-survey">
      <div className="survey-header">
        <div className="survey-teaser">{survey.teaser}</div>

        <div className="survey-dismiss">
          <button
            type="button"
            aria-label={"Hide this survey"}
            onClick={() => dismiss()}
            title={"Hide this survey"}
          >
            <Icon name={"cancel"} />
          </button>
        </div>
      </div>
      <details className="survey-container" ref={details}>
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
