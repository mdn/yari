import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useSearchParams } from "react-router-dom";

import { useGleanClick } from "../telemetry/glean-context";
import { OBSERVATORY } from "../telemetry/constants";
import { SidePlacement } from "../ui/organisms/placement";
import Container from "../ui/atoms/container";

import ObservatoryCSP from "./results/csp";
import {
  ERROR_MAP,
  FeedbackLink,
  useResult,
  useUpdateResult as useRescanTrigger,
} from "./utils";
import { ObservatoryLayout } from "./layout";
import { Progress } from "./progress";
import { ObservatoryDocsNav } from "./docs";
import { ObservatoryCookies } from "./results/cookies";
import { ObservatoryHeaders } from "./results/headers";
import { ObservatoryHistory } from "./results/history";
import { ObservatoryRating } from "./results/rating";
import { ObservatoryTests } from "./results/tests";
import ObservatoryBenchmark from "./results/benchmark";
import "./results.scss";
import {
  OBSERVATORY_TITLE,
  OBSERVATORY_TITLE_FULL,
} from "../../../libs/constants";

export default function ObservatoryResults() {
  const { pathname, search } = useLocation();
  const [searchParams] = useSearchParams();
  const host = searchParams.get("host");

  const { data: result, isLoading, error } = useResult(host!);

  // Used for rescanning the current host
  const {
    trigger,
    isMutating,
    error: updateError,
  } = useRescanTrigger(host || "");

  const gleanClick = useGleanClick();

  document.title = `Scan results for ${host} | ${OBSERVATORY_TITLE_FULL}`;

  const combinedError = error || updateError;

  useEffect(() => {
    if (combinedError && !isMutating) {
      gleanClick(
        `${OBSERVATORY}: error -> ${ERROR_MAP[combinedError.name] || combinedError.message}`
      );
    }
  }, [combinedError, isMutating, gleanClick]);

  const hasData = host && result && !isLoading && !isMutating;
  return host ? (
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
                <span className="accent">{OBSERVATORY_TITLE}</span> Report{" "}
              </h1>
              <FeedbackLink />
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
        label: "Scoring",
        key: "scoring",
        element: <ObservatoryTests result={result} />,
      },
      {
        label: "CSP analysis",
        key: "csp",
        element: <ObservatoryCSP result={result} />,
      },
      {
        label: "Raw server headers",
        key: "headers",
        element: <ObservatoryHeaders result={result} />,
      },
      {
        label: "Cookies",
        key: "cookies",
        element: <ObservatoryCookies result={result} />,
      },
      {
        label: "Scan history",
        key: "history",
        element: <ObservatoryHistory result={result} />,
      },
      {
        label: "Benchmark comparison",
        key: "benchmark",
        element: <ObservatoryBenchmark result={result} />,
      },
    ];
  }, [result]);
  const defaultTabKey = tabs[0].key!;
  const initialTabKey = window.location.hash.replace("#", "") || defaultTabKey;
  const initialTab = tabs.findIndex((tab) => tab.key === initialTabKey);
  const [selectedTab, setSelectedTab] = useState(
    initialTab === -1 ? 0 : initialTab
  );
  useEffect(() => {
    const handleHashChange = () => {
      const tabIndex = tabs.findIndex(
        (tab) => tab.key === window.location.hash.replace("#", "")
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
    const hash = tabs[selectedTab]?.key || defaultTabKey;
    window.history.replaceState(
      "",
      "",
      window.location.pathname +
        window.location.search +
        (hash !== defaultTabKey ? "#" + hash : "")
    );
  }, [tabs, selectedTab, defaultTabKey]);

  return (
    <section className="scan-results">
      <h2 className="result" id="scan-results-header">
        Scan results
      </h2>
      <ol
        className="tabs-list"
        role="tablist"
        aria-labelledby="scan-results-header"
      >
        {tabs.map((t, i) => {
          return (
            <li id={`tabs-${i}`} className="tabs-list-item" key={`tli-${i}`}>
              <input
                className="visually-hidden"
                id={`tab-${i}`}
                name="selected"
                type="radio"
                role="tab"
                checked={i === selectedTab}
                aria-controls={`tab-container-${i}`}
                onChange={() => {
                  gleanClick(`${OBSERVATORY}: tab -> ${t.key}`);
                  setSelectedTab(i);
                }}
              />
              <label htmlFor={`tab-${i}`} id={`tab-label-${i}`}>
                {t.label}
              </label>
              <section
                className="tab-content"
                role="tabpanel"
                aria-labelledby={`tab-label-${i}`}
                id={`tab-container-${i}`}
              >
                <figure className="scroll-container">{t.element}</figure>
              </section>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
