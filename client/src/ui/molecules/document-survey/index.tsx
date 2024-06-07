import React from "react";
import { Doc } from "../../../../../libs/types/document";
import "./index.scss";
import { Survey, SURVEYS } from "./surveys";
import { getSurveyState, writeSurveyState } from "./utils";
import { useIsServer } from "../../../hooks";
import { Icon } from "../../atoms/icon";
import { useLocation } from "react-router";
import { DEV_MODE, WRITER_MODE } from "../../../env";
import { useGleanClick } from "../../../telemetry/glean-context";
import { SURVEY } from "../../../telemetry/constants";

const FORCE_SURVEY_PREFIX = "#FORCE_SURVEY=";

export function DocumentSurvey({ doc }: { doc: Doc }) {
  const isServer = useIsServer();
  const location = useLocation();

  let force = location.hash.startsWith(FORCE_SURVEY_PREFIX);

  const survey = React.useMemo(
    () =>
      SURVEYS.find((survey) => {
        if (isServer || (WRITER_MODE && !DEV_MODE)) {
          return false;
        }

        if (force) {
          return survey.key === location.hash.slice(FORCE_SURVEY_PREFIX.length);
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
    [doc, isServer, location.hash, force]
  );

  return survey ? <SurveyDisplay survey={survey} force={force} /> : <></>;
}

function SurveyDisplay({ survey, force }: { survey: Survey; force: boolean }) {
  const gleanClick = useGleanClick();
  const details = React.useRef<HTMLDetailsElement | null>(null);

  const [originalState] = React.useState(() => getSurveyState(survey.bucket));
  const [state, setState] = React.useState(() => originalState);

  React.useEffect(() => {
    writeSurveyState(survey.bucket, state);
  }, [state, survey.bucket]);

  const seen = React.useCallback(() => {
    if (state.seen_at) {
      return;
    }

    const timeoutId = setTimeout(
      () =>
        setState((state) => ({
          ...state,
          seen_at: Date.now(),
        })),
      0
    );
    gleanClick(`${SURVEY}: seen ${survey.bucket}`);

    return () => clearTimeout(timeoutId);
  }, [gleanClick, state.seen_at, survey.bucket]);

  function dismiss() {
    setState({
      ...state,
      dismissed_at: Date.now(),
    });
    gleanClick(`${SURVEY}: dismissed ${survey.bucket}`);
  }

  function submitted() {
    setState({
      ...state,
      submitted_at: Date.now(),
    });
    gleanClick(`${SURVEY}: submitted ${survey.bucket}`);
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
        gleanClick(`${SURVEY}: opened ${survey.bucket}`);
      }
    };

    current.addEventListener("toggle", listener);

    return () => current.removeEventListener("toggle", listener);
  }, [details, state, survey, gleanClick]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => seen(), 0);

    return () => clearTimeout(timeoutId);
  }, [seen]);

  React.useEffect(() => {
    // For this to work, the Survey needs this JavaScript action:
    // window.parent && window.parent.postMessage("submit", "*");

    const listener = (event: MessageEvent) => {
      if (
        event.origin === "https://survey.alchemer.com" &&
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

  if (!force && (state.dismissed_at || originalState.submitted_at)) {
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
            style={{ overflow: "hidden" }}
          ></iframe>
        )}
      </details>
      {survey.footnote && (
        <section className="survey-footer">({survey.footnote})</section>
      )}
    </div>
  );
}
