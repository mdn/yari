import { ObservatoryResult } from "./types";
import { Navigate, useLocation } from "react-router";
import { SidePlacement } from "../ui/organisms/placement";
import { useResult, useUpdateResult } from ".";
import ObservatoryCSP from "./csp";
import { ERROR_MAP, fixMinusSymbol, Link, PassIcon } from "./utils";
import Container from "../ui/atoms/container";
import { Button } from "../ui/atoms/button";
import { useEffect, useMemo, useState } from "react";
import ObservatoryBenchmark from "./benchmark";
import useSWRImmutable from "swr/immutable";
import InternalLink from "../ui/atoms/internal-link";
import { Tooltip } from "./tooltip";
import { useGleanClick } from "../telemetry/glean-context";
import { OBSERVATORY } from "../telemetry/constants";

import { ReactComponent as StarsSVG } from "../../public/assets/observatory/stars.svg";
import { ObservatoryLayout } from "./layout";
import { Progress } from "./progress";
import { ObservatoryDocsNav } from "./docs";
import { useIsServer } from "../hooks";
import { useSearchParams } from "react-router-dom";

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

export default function ObservatoryResults() {
  const { pathname, search } = useLocation();
  const [searchParams] = useSearchParams();
  const host = searchParams.get("host");

  const { data: result, isLoading, error } = useResult(host!);

  // Used for rescan
  const { trigger, isMutating, error: updateError } = useUpdateResult(host!);
  const gleanClick = useGleanClick();

  document.title = `Scan results for ${host} | HTTP Observatory | MDN`;

  const combinedError = error || updateError;

  useEffect(() => {
    if (combinedError && !isMutating) {
      gleanClick(
        `${OBSERVATORY}: error: ${ERROR_MAP[combinedError.name] || combinedError.message}`
      );
    }
  }, [combinedError, isMutating, gleanClick]);

  const hasData = !!host && !!result && !isLoading && !isMutating;
  return !!host ? (
    <ObservatoryLayout
      parents={[
        {
          title: `Report: ${host}`,
          uri: `${pathname}${search}`,
        },
      ]}
    >
      <div className="observatory-results">
        <Container extraClasses="observatory-wrapper">
          <section className="header">
            <section className="heading-and-actions">
              <h1>
                <span className="accent">HTTP Observatory</span> Report{" "}
              </h1>
            </section>
            {hasData && !combinedError ? (
              <ObservatoryRating
                result={result!}
                host={host}
                rescanTrigger={trigger}
              />
            ) : isLoading ? (
              <section className="scan-rescan">
                <Progress message={`Loading ${host}…`} />
              </section>
            ) : isMutating ? (
              <section className="scan-rescan">
                <Progress message={`Rescanning ${host}…`} />
              </section>
            ) : (
              <section className="scan-rescan">
                <div className="error">
                  Error:{" "}
                  {ERROR_MAP[combinedError.name] || combinedError.message}
                </div>
                <a href="./">Observatory Home</a>
              </section>
            )}
          </section>
          <nav className="sidebar">
            <ObservatoryDocsNav />
          </nav>
          {hasData && !combinedError && (
            <section className="main">
              <ObservatoryScanResults result={result} host={host} />
            </section>
          )}
          <SidePlacement />
        </Container>
      </div>
    </ObservatoryLayout>
  ) : (
    <Navigate to="../" />
  );
}

function ObservatoryScanResults({ result, host }) {
  const tabs = useMemo(() => {
    return [
      {
        name: "Test result",
        hash: "test_result",
        element: <ObservatoryTests result={result} />,
        glean: "tab-test-result",
      },
      {
        name: "CSP analysis",
        hash: "csp_analysis",
        element: <ObservatoryCSP result={result} />,
        glean: "tab-csp-analysis",
      },
      {
        name: "Raw server headers",
        hash: "raw_server_headers",
        element: <ObservatoryHeaders result={result} />,
        glean: "tab-raw-server-headers",
      },
      {
        name: "Cookies",
        hash: "cookies",
        element: <ObservatoryCookies result={result} />,
        glean: "tab-cookies",
      },
      {
        name: "Scan history",
        hash: "scan_history",
        element: <ObservatoryHistory result={result} />,
        glean: "tab-scan-history",
      },
      {
        name: "Benchmark comparison",
        hash: "benchmark_comparison",
        element: <ObservatoryBenchmark result={result} />,
        glean: "tab-benchmark",
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

  const gleanClick = useGleanClick();

  useEffect(() => {
    const hash = tabs[selectedTab]?.hash || defaultTabHash;
    window.history.replaceState(
      "",
      "",
      window.location.pathname +
        window.location.search +
        (hash !== defaultTabHash ? "#" + hash : "")
    );
  }, [tabs, selectedTab, defaultTabHash]);

  return (
    <section className="scan-results">
      <h2 className="result">Scan results</h2>
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
                onChange={() => {
                  gleanClick(`${OBSERVATORY}: click: ${t.glean}`);
                  setSelectedTab(i);
                }}
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
  const gleanClick = useGleanClick();
  const isServer = useIsServer();
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
                {fixMinusSymbol(result.scan.grade)}
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
                          <td>{fixMinusSymbol(st.grade)}</td>
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
        <section className="data">
          <div>
            <a href="docs/scoring">
              <span className="label">Score:</span>
            </a>{" "}
            {result.scan.score}/100
          </div>
          <div>
            <a href="#scan_history">
              <span className="label">Scan Time:</span>
            </a>{" "}
            {new Date(result.scan.scanned_at).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "medium",
            })}
          </div>
          <a href="docs/scoring##tests-and-score-modifiers">
            <span className="label">Tests Passed:</span>
          </a>{" "}
          {result.scan.tests_passed}/{result.scan.tests_quantity}
        </section>
        <section className="actions">
          {!isServer && (
            <CountdownButton
              host={host}
              from={result.scan.scanned_at}
              duration={60}
              title="Rescan"
              onClickHandler={rescanTrigger}
            />
          )}
          <div className="scan-another">
            <InternalLink
              to="../"
              onClick={() => gleanClick(`${OBSERVATORY}: click: scan-another`)}
            >
              Scan another website
            </InternalLink>
          </div>
        </section>
      </section>
    </>
  );
}

function hostAsRedirectChain(host, result: ObservatoryResult) {
  const chain = result.tests.redirection?.route;
  if (!chain || chain.length < 1) {
    return host;
  }
  try {
    const firstUrl = new URL(chain[0]);
    const lastUrl = new URL(chain[chain.length - 1]);
    if (firstUrl.hostname === lastUrl.hostname) {
      return host;
    }
    return `${firstUrl.hostname} → ${lastUrl.hostname}`;
  } catch (e) {
    return host;
  }
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
  });

  const gleanClick = useGleanClick();

  function rescan() {
    gleanClick(`${OBSERVATORY}: click: rescan`);
    onClickHandler();
  }

  const isExpired = remainingTime <= 0;
  const remainingSecs = Math.floor(remainingTime / 1000) + 1;
  const progressPercent = (remainingSecs * 100) / 60;
  return !isExpired ? (
    <Button isDisabled={true}>
      <div
        className="progress"
        style={{
          background: `conic-gradient(var(--button-color) 0grad, ${progressPercent}%, rgba(0,0,0,0) ${progressPercent}% 100%)`,
        }}
      ></div>
      <small>
        Wait {remainingSecs}s to {title.toLowerCase()}
      </small>
    </Button>
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
                  <td data-header="Test">
                    <Link href={test.link}>{test.title}</Link>
                  </td>
                  {test.pass === null ? (
                    <td data-header="Score">-</td>
                  ) : (
                    <td className="score" data-header="Score">
                      <span>
                        <span className="obs-score-value">
                          {fixMinusSymbol(test.score_modifier)}
                        </span>
                        <PassIcon pass={test.pass} />
                      </span>
                    </td>
                  )}
                  <td
                    data-header="Reason"
                    dangerouslySetInnerHTML={{
                      __html: test.score_description,
                    }}
                  />
                  <td
                    data-header="Advice"
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
                  <td data-header="Date">
                    {new Date(scanned_at).toLocaleString([], {
                      dateStyle: "full",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td data-header="Score">{score}</td>
                  <td data-header="Grade">{fixMinusSymbol(grade)}</td>
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
                <td data-header="Name">{key}</td>
                <td data-header="Expires">
                  {value.expires
                    ? new Date(value.expires).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Session"}
                </td>
                <td data-header="Path">
                  <code>{value.path}</code>
                </td>
                <td data-header="Secure">
                  <PassIcon pass={value.secure} />
                  <span className="visually-hidden">
                    {value.secure ? "True" : "False"}
                  </span>
                </td>
                <td data-header="HttpOnly">
                  <PassIcon pass={value.httponly} />
                  <span className="visually-hidden">
                    {value.httponly ? "True" : "False"}
                  </span>
                </td>
                <td data-header="SameSite">
                  {value.samesite && <code>{value.samesite}</code>}
                </td>
                <td data-header="Prefixed">
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
          <tbody>
            <tr>
              <td>No cookies detected</td>
            </tr>
          </tbody>
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
                  <td data-header="Header">
                    <HeaderLink header={header} />
                  </td>
                  <td data-header="Value">{value}</td>
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
