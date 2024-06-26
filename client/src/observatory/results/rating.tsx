import { useMemo } from "react";

import { useIsServer } from "../../hooks";
import { useGleanClick } from "../../telemetry/glean-context";
import InternalLink from "../../ui/atoms/internal-link";
import { OBSERVATORY } from "../../telemetry/constants";

import { ObservatoryResult, SCORING_TABLE } from "../types";
import { formatDateTime, formatMinus, hostAsRedirectChain } from "../utils";
import { Tooltip } from "../tooltip";
import { RescanButton } from "./rescan-button";
import { ReactComponent as StarsSVG } from "../../../public/assets/observatory/stars.svg";

export function ObservatoryRating({
  result,
  host,
  rescanTrigger,
}: {
  result: ObservatoryResult;
  host: string;
  rescanTrigger: () => void;
}) {
  const gleanClick = useGleanClick();
  const isServer = useIsServer();

  const arrowState = useMemo(() => {
    const oldScore = result.history.length
      ? result.history.at(-1)?.score
      : undefined;
    const newScore = result.scan.score;
    if (
      newScore !== undefined &&
      oldScore !== undefined &&
      newScore !== oldScore
    ) {
      return oldScore < newScore ? "up" : "down";
    } else {
      return "none";
    }
  }, [result]);

  return (
    <>
      <h2 className="summary">
        Scan summary:{" "}
        <span className="host">{hostAsRedirectChain(host, result)}</span>
      </h2>
      <section className="scan-result">
        <section className="grade-trend">
          <div className="overall">
            <span
              aria-label="show info tooltip"
              className="info-tooltip"
              tabIndex={0}
            >
              <div
                className={`grade grade-${result.scan.grade?.[0]?.toLowerCase()}`}
              >
                {formatMinus(result.scan.grade)}
              </div>
              <Tooltip>
                <table
                  className="grade-tooltip"
                  id="grades-table"
                  role="tooltip"
                >
                  <thead>
                    <tr>
                      <th>Grade</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCORING_TABLE.map((st) => {
                      return (
                        <tr
                          className={
                            result.scan.grade === st.grade ? "current" : ""
                          }
                          key={st.grade}
                        >
                          <td>{formatMinus(st.grade)}</td>
                          <td>
                            {st.scoreText}{" "}
                            {result.scan.grade === st.grade && st.stars && (
                              <StarsSVG />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Tooltip>
            </span>
          </div>
          <Trend arrowState={arrowState} />
        </section>
        <section className="data">
          <div>
            <a href="/en-US/observatory/docs/tests_and_scoring" target="_blank">
              <span className="label">Score</span>
            </a>
            : <>{result.scan.score}&thinsp;/&thinsp;100</>
          </div>
          <div>
            <a href="#history">
              <span className="label">Scan Time</span>
            </a>
            : {formatDateTime(new Date(result.scan.scanned_at))}
          </div>
          <a href="/en-US/observatory/docs/tests_and_scoring" target="_blank">
            <span className="label">Tests Passed</span>
          </a>
          : {result.scan.tests_passed}&thinsp;/&thinsp;
          {result.scan.tests_quantity}
        </section>
        <section className="actions">
          {!isServer && (
            <RescanButton
              from={new Date(result.scan.scanned_at)}
              duration={60}
              onClickHandler={rescanTrigger}
            />
          )}
          <div className="scan-another">
            <InternalLink
              to="../"
              onClick={() => gleanClick(`${OBSERVATORY}: scan-another`)}
            >
              Scan another website
            </InternalLink>
          </div>
        </section>
      </section>
    </>
  );
}

type ARROW_STATE = "up" | "down" | "none";

function Trend({ arrowState }: { arrowState: ARROW_STATE }) {
  switch (arrowState) {
    case "up":
      return (
        <div className="trend">
          <span className="arrow-up" aria-hidden="true">
            ↗︎
          </span>{" "}
          since last scan
        </div>
      );
    case "down":
      return (
        <div className="trend">
          <span className="arrow-down" aria-hidden="true">
            ↘︎
          </span>{" "}
          since last scan
        </div>
      );
    default:
      return [];
  }
}
