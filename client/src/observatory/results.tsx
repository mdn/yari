import { ObservatoryResult } from "./types";
import { useParams } from "react-router";
import { SidePlacement } from "../ui/organisms/placement";
import { Loading } from "../ui/atoms/loading";
import NoteCard from "../ui/molecules/notecards";
import { useResult, useUpdateResult } from ".";
import ObservatoryCSP from "./csp";
import { Link, PassIcon } from "./utils";
import Container from "../ui/atoms/container";
import { Button } from "../ui/atoms/button";
import { useEffect, useMemo, useState } from "react";
import ObservatoryBenchmark from "./benchmark";
import useSWRImmutable from "swr/immutable";
import InternalLink from "../ui/atoms/internal-link";
import { Tooltip } from "./tooltip";

import { ReactComponent as StarsSVG } from "../../public/assets/observatory/stars.svg";

const scoringTable = [
  { grade: "A+", scoreText: "100+", score: 100, stars: true },
  { grade: "A", scoreText: "90", score: 90, stars: true },
  { grade: "A-", scoreText: "85", score: 85, stars: true },
  { grade: "B+", scoreText: "80", score: 80 },
  { grade: "B", scoreText: "70", score: 70 },
  { grade: "B-", scoreText: "65", score: 65 },
  { grade: "C+", scoreText: "60", score: 60 },
  { grade: "C", scoreText: "50", score: 50 },
  { grade: "C-", scoreText: "45", score: 45 },
  { grade: "D+", scoreText: "40", score: 40 },
  { grade: "D", scoreText: "30", score: 30 },
  { grade: "D-", scoreText: "25", score: 25 },
  { grade: "F", scoreText: "0", score: 0 },
];

export function ObservatoryGrades() {
  return (
    <div className="observatory-results">
      <Container extraClasses="observatory-wrapper">
        <section className="header">
          <section className="heading-and-actions">
            <h1>
              <span className="accent">HTTP Observatory</span> Grades{" "}
            </h1>
          </section>
        </section>

        <section className="main">
          <section className="scan-result">
            <section className="grade-trend">
              <div className="overall" style={{ display: "flex", gap: "1rem" }}>
                {scoringTable.map(({ grade }) => (
                  <p>
                    <div
                      key={grade}
                      className={`grade grade-${grade[0]?.toLowerCase()}`}
                    >
                      {grade}
                    </div>
                  </p>
                ))}
              </div>
            </section>
          </section>
        </section>
      </Container>
    </div>
  );
}

export default function ObservatoryResults() {
  const { host } = useParams();
  const { data: result, isLoading, error } = useResult(host);

  // Used for rescan
  const { trigger, isMutating, error: updateError } = useUpdateResult(host!);

  document.title = `Scan results for ${host} | HTTP Observatory | MDN`;

  const hasData = !!host && !!result && !isLoading && !isMutating;
  return (
    <div className="observatory-results">
      <Container extraClasses="observatory-wrapper">
        <section className="header">
          <section className="heading-and-actions">
            <h1>
              <span className="accent">HTTP Observatory</span> Report{" "}
            </h1>
          </section>
          {hasData ? (
            <ObservatoryRating
              result={result!}
              host={host}
              rescanTrigger={trigger}
            />
          ) : isLoading || isMutating ? (
            <Loading delay={200} />
          ) : (
            <NoteCard type="error">
              <h4>Error</h4>
              <p>
                {error
                  ? error.message
                  : updateError
                    ? updateError.message
                    : "An error occurred."}
              </p>
            </NoteCard>
          )}
        </section>
        {hasData && (
          <section className="main">
            <ObservatoryScanResults result={result} host={host} />
          </section>
        )}
        <SidePlacement />
      </Container>
    </div>
  );
}

function ObservatoryScanResults({ result, host }) {
  const tabs = useMemo(() => {
    return [
      {
        name: "Test Result",
        hash: "test_result",
        element: <ObservatoryTests result={result} />,
      },
      {
        name: "CSP Analysis",
        hash: "csp_analysis",
        element: <ObservatoryCSP result={result} />,
      },
      {
        name: "Raw Server Headers",
        hash: "raw_server_headers",
        element: <ObservatoryHeaders result={result} />,
      },
      {
        name: "Cookies",
        hash: "cookies",
        element: <ObservatoryCookies result={result} />,
      },
      {
        name: "Scan History",
        hash: "scan_history",
        element: <ObservatoryHistory result={result} />,
      },
      {
        name: "Benchmark Comparison",
        hash: "benchmark_comparison",
        element: <ObservatoryBenchmark result={result} />,
      },
    ];
  }, [result]);
  const defaultTabHash = tabs[0].hash!;
  const initialTabHash =
    window.location.hash.replace("#", "") || defaultTabHash;
  const initialTab = tabs.findIndex((tab) => tab.hash === initialTabHash);
  const [selectedTab, setSelectedTab] = useState(
    initialTab === -1 ? 0 : initialTab
  );
  useEffect(() => {
    const handleHashChange = () => {
      const tabIndex = tabs.findIndex(
        (tab) => tab.hash === window.location.hash.replace("#", "")
      );
      setSelectedTab(tabIndex === -1 ? 0 : tabIndex);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  });

  useEffect(() => {
    window.location.hash = tabs[selectedTab]?.hash || defaultTabHash;
  }, [tabs, selectedTab, defaultTabHash]);

  return (
    <section className="scan-results">
      <h2>
        <span className="icon-bullet">
          <svg
            width="16"
            height="21"
            viewBox="0 0 16 21"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 6.04143C9 6.93111 9.72123 7.65234 10.6109 7.65234C12.0461 7.65234 12.7648 5.91716 11.75 4.90234C10.7352 3.88753 9 4.60626 9 6.04143ZM2 0.652344H9.17157C9.70201 0.652344 10.2107 0.863057 10.5858 1.23813L15.4142 6.06656C15.7893 6.44163 16 6.95034 16 7.48077V18.6523C16 19.1828 15.7893 19.6915 15.4142 20.0666C15.0391 20.4416 14.5304 20.6523 14 20.6523H2C0.89 20.6523 0 19.7523 0 18.6523V2.65234C0 1.54234 0.89 0.652344 2 0.652344ZM3 17.6523C3 18.2046 3.44772 18.6523 4 18.6523C4.55228 18.6523 5 18.2046 5 17.6523V13.6523C5 13.1001 4.55228 12.6523 4 12.6523C3.44772 12.6523 3 13.1001 3 13.6523V17.6523ZM7 17.6523C7 18.2046 7.44772 18.6523 8 18.6523C8.55229 18.6523 9 18.2046 9 17.6523V11.6523C9 11.1001 8.55229 10.6523 8 10.6523C7.44772 10.6523 7 11.1001 7 11.6523V17.6523ZM11 17.6523C11 18.2046 11.4477 18.6523 12 18.6523C12.5523 18.6523 13 18.2046 13 17.6523V15.6523C13 15.1001 12.5523 14.6523 12 14.6523C11.4477 14.6523 11 15.1001 11 15.6523V17.6523Z" />
          </svg>{" "}
        </span>
        Scan results
      </h2>
      <ol className="tabs-list">
        {tabs.map((t, i) => {
          return (
            <li id={`tabs-${i}`} className="tabs-list-item" key={`tli-${i}`}>
              <input
                className="visually-hidden"
                id={`tab-${i}`}
                name="selected"
                type="radio"
                checked={i === selectedTab}
                onChange={() => setSelectedTab(i)}
              />
              <label htmlFor={`tab-${i}`}>{t.name}</label>
              {t.element}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function trend(result: ObservatoryResult) {
  if (result.scan.score && result.history.length > 0) {
    const oldScore = result.history[result.history.length - 1].score;
    if (oldScore < result.scan.score) {
      return (
        <div className="trend">
          <span className="arrow-up">↗︎</span> since last scan
        </div>
      );
    } else if (oldScore > result.scan.score) {
      return (
        <div className="trend">
          <span className="arrow-down">↘︎</span> since last scan
        </div>
      );
    } else {
      return [];
    }
  }
}

function ObservatoryRating({
  result,
  host,
  rescanTrigger,
}: {
  result: ObservatoryResult;
  host: string;
  rescanTrigger: Function;
}) {
  return (
    <>
      <h2>
        <span className="icon-bullet">
          <svg
            width="20"
            height="19"
            viewBox="0 0 20 19"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15.45 12.73L20 4.86V16.55V18.55H0V0.55H2V13.09L7.5 3.55L14 7.33L18.24 0L19.97 1L14.74 10.05L8.23 6.3L2.31 16.55H4.57L8.96 8.99L15.45 12.73Z" />
          </svg>{" "}
        </span>
        Scan summary
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
                {result.scan.grade}
              </div>
              <Tooltip>
                <table className="grade-tooltip">
                  <thead>
                    <tr>
                      <th>Grade</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoringTable.map((st) => {
                      return (
                        <tr
                          className={
                            result.scan.grade === st.grade ? "current" : ""
                          }
                          key={st.grade}
                        >
                          <td>{st.grade}</td>
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
          {trend(result)}
        </section>
        <section className="host">
          <span className="label">Host:</span> {host}
        </section>
        <section className="data">
          <div>
            <Link href="docs/scoring">
              <span className="label">Score:</span>
            </Link>{" "}
            {result.scan.score}/100
          </div>
          <div>
            <span className="label">Scan Time: </span>
            {new Date(result.scan.scanned_at).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "medium",
            })}
          </div>
          <span className="label">Tests Passed:</span>{" "}
          {result.scan.tests_passed}/{result.scan.tests_quantity}
        </section>
        <section className="actions">
          <CountdownButton
            host={host}
            from={result.scan.scanned_at}
            duration={60}
            title="Rescan"
            onClickHandler={rescanTrigger}
          />
          <div>
            <InternalLink className="scan-another" to="../">
              Scan another website
            </InternalLink>
          </div>
        </section>
      </section>
    </>
  );
}

function CountdownButton({
  host,
  from,
  duration,
  title,
  onClickHandler,
}: {
  host: string;
  from: string;
  duration: number;
  title: string;
  onClickHandler: Function;
}) {
  function calculateRemainingTime() {
    const endTime = new Date(from).getTime() + duration * 1000;
    return Math.max(0, endTime - new Date().getTime());
  }
  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, duration]);

  function rescan() {
    onClickHandler();
  }

  const isExpired = remainingTime <= 0;

  return !isExpired ? (
    <Button isDisabled={true}>{Math.floor(remainingTime / 1000) + 1}</Button>
  ) : (
    <Button onClickHandler={rescan}>{title}</Button>
  );
}

function ObservatoryTests({ result }: { result: ObservatoryResult }) {
  return Object.keys(result.tests).length !== 0 ? (
    <section className="tab-content">
      <figure className="scroll-container">
        <table className="tests">
          <thead>
            <tr>
              <th>Test</th>
              <th>Score</th>
              <th>Reason</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(result.tests).map(([name, test]) => {
              return (
                <tr key={name}>
                  <td>
                    <Link href={test.link}>{test.title}</Link>
                  </td>
                  {test.pass === null ? (
                    <td>-</td>
                  ) : (
                    <td className="score">
                      <span className="obs-score-value">
                        {test.score_modifier}
                      </span>
                      <PassIcon pass={test.pass} />
                    </td>
                  )}
                  <td
                    dangerouslySetInnerHTML={{
                      __html: test.score_description,
                    }}
                  />
                  <td
                    dangerouslySetInnerHTML={{
                      __html:
                        test.recommendation || `<p class="obs-none">None</p>`,
                    }}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </figure>
    </section>
  ) : null;
}

function ObservatoryHistory({ result }: { result: ObservatoryResult }) {
  return result.history.length ? (
    <section className="tab-content">
      <figure className="scroll-container">
        <table className="history">
          <thead>
            <tr>
              <th>Date</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {[...result.history]
              .reverse()
              .map(({ scanned_at, score, grade }) => (
                <tr key={scanned_at}>
                  <td>
                    {new Date(scanned_at).toLocaleString([], {
                      dateStyle: "full",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td>{score}</td>
                  <td>{grade}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </figure>
    </section>
  ) : null;
}

function ObservatoryCookies({ result }: { result: ObservatoryResult }) {
  const cookies = result.tests["cookies"]?.data;
  return cookies && Object.keys(cookies).length !== 0 ? (
    <section className="tab-content">
      <figure className="scroll-container">
        <table className="cookies">
          <thead>
            <tr>
              <th>Name</th>
              <th>Expires</th>
              <th>Path</th>
              <th>Secure</th>
              <th>HttpOnly</th>
              <th>SameSite</th>
              <th>Prefixed</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(cookies).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  {value.expires
                    ? new Date(value.expires).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Session"}
                </td>
                <td>
                  <code>{value.path}</code>
                </td>
                <td>
                  <PassIcon pass={value.secure} />
                  <span className="visually-hidden">
                    {value.secure ? "True" : "False"}
                  </span>
                </td>
                <td>
                  <PassIcon pass={value.httponly} />
                  <span className="visually-hidden">
                    {value.httponly ? "True" : "False"}
                  </span>
                </td>
                <td>{value.samesite && <code>{value.samesite}</code>}</td>
                <td>
                  {[key]
                    .map(
                      (x) => x.startsWith("__Host") || x.startsWith("__Secure")
                    )
                    .map((x) => (
                      <span key={key}>
                        <PassIcon pass={x} />
                        <span className="visually-hidden">
                          {x ? "True" : "False"}
                        </span>
                      </span>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </section>
  ) : (
    <section className="tab-content">
      <figure className="scroll-container">
        <table className=" cookies">
          <thead>
            <tr>
              <th>No cookies detected</th>
            </tr>
          </thead>
        </table>
      </figure>
    </section>
  );
}

function ObservatoryHeaders({ result }: { result: ObservatoryResult }) {
  return result.scan.response_headers ? (
    <section className="tab-content">
      <figure className="scroll-container">
        <table className="headers">
          <thead>
            <tr>
              <th>Header</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(result.scan.response_headers).map(
              ([header, value]) => (
                <tr key={header}>
                  <td>
                    <HeaderLink header={header} />
                  </td>
                  <td>{value}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </figure>
    </section>
  ) : null;
}

function HeaderLink({ header }: { header: string }) {
  // try a HEAD fetch for /en-US/docs/Web/HTTP/Headers/<HEADERNAME>/metadata.json
  // if successful, link to /en-US/docs/Web/HTTP/Headers/<HEADERNAME>
  const { data } = useHeaderLink(header);
  const hasData = !!data;
  const displayHeaderName = upperCaseHeaderName(header);
  return hasData ? (
    <a href={data} target="_blank" rel="noreferrer">
      {displayHeaderName}
    </a>
  ) : (
    <>{displayHeaderName}</>
  );
}

function useHeaderLink(header: string) {
  const prettyHeaderName = upperCaseHeaderName(header);
  return useSWRImmutable(`headerLink-${header}`, async (key) => {
    const url = `/en-US/docs/Web/HTTP/Headers/${encodeURIComponent(prettyHeaderName)}/metadata.json`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok
        ? `/en-US/docs/Web/HTTP/Headers/${encodeURIComponent(prettyHeaderName)}`
        : null;
    } catch (e) {
      return null;
    }
  });
}

function upperCaseHeaderName(header: string) {
  return header
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.substring(1) : ""))
    .join("-");
}
