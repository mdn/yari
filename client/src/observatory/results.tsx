import { ObservatoryResult } from "./types";
import { useParams } from "react-router";
import { Icon } from "../ui/atoms/icon";
import { SidePlacement } from "../ui/organisms/placement";
import { Loading } from "../ui/atoms/loading";
import NoteCard from "../ui/molecules/notecards";
import { useResult } from ".";
import ObservatoryCSP from "./csp";
import { Link, PassIcon } from "./utils";
import Container from "../ui/atoms/container";
import { Button } from "../ui/atoms/button";
import { useState } from "react";

// const TEST_MAP: Record<string, { name: string; url: string; info: string }> = {
//   "content-security-policy": {
//     name: "Content Security Policy",
//     url: "https://infosec.mozilla.org/guidelines/web_security#content-security-policy",
//     info: "Content Security Policy (CSP) can prevent a wide range of cross-site scripting (XSS) and clickjacking attacks against your website.",
//   },
//   cookies: {
//     name: "Cookies",
//     url: "https://infosec.mozilla.org/guidelines/web_security#cookies",
//     info: "Using cookies attributes such as Secure and HttpOnly can protect users from having their personal information stolen.",
//   },
//   "cross-origin-resource-sharing": {
//     name: "Cross-origin Resource Sharing",
//     url: "https://infosec.mozilla.org/guidelines/web_security#cross-origin-resource-sharing",
//     info: "Incorrectly configured CORS settings can allow foreign sites to read your site's contents, possibly allowing them access to private user information.",
//   },
//   redirection: {
//     name: "Redirection",
//     url: "https://infosec.mozilla.org/guidelines/web_security#http-redirections",
//     info: "Properly configured redirections from HTTP to HTTPS allow browsers to correctly apply HTTP Strict Transport Security (HSTS) settings.",
//   },
//   "referrer-policy": {
//     name: "Referrer Policy",
//     url: "https://infosec.mozilla.org/guidelines/web_security#referrer-policy",
//     info: "Referrer Policy can protect the privacy of your users by restricting the contents of the HTTP Referer header.",
//   },
//   "strict-transport-security": {
//     name: "HTTP Strict Transport Security",
//     url: "https://infosec.mozilla.org/guidelines/web_security#http-strict-transport-security",
//     info: "HTTP Strict Transport Security (HSTS) instructs web browsers to visit your site only over HTTPS.",
//   },
//   "subresource-integrity": {
//     name: "Subresource Integrity",
//     url: "https://infosec.mozilla.org/guidelines/web_security#subresource-integrity",
//     info: "Subresource Integrity protects against JavaScript files and stylesheets stored on content delivery networks (CDNs) from being maliciously modified.",
//   },
//   "x-content-type-options": {
//     name: "X-Content-Type-Options",
//     url: "https://infosec.mozilla.org/guidelines/web_security#x-content-type-options",
//     info: "X-Content-Type-Options instructs browsers to not guess the MIME types of files that the web server is delivering.",
//   },
//   "x-frame-options": {
//     name: "X-Frame-Options",
//     url: "https://infosec.mozilla.org/guidelines/web_security#x-frame-options",
//     info: "X-Frame-Options controls whether your site can be framed, protecting against clickjacking attacks. It has been superseded by Content Security Policy's frame-ancestors directive, but should still be used for now.",
//   },
//   "x-xss-protection": {
//     name: "X-XSS-Protection",
//     url: "https://infosec.mozilla.org/guidelines/web_security.html#x-xss-protection",
//     info: "X-XSS-Protection protects against reflected cross-site scripting (XSS) attacks in IE and Chrome, but has been superseded by Content Security Policy. It can still be used to protect users of older web browsers.",
//   },
// };

export default function ObservatoryResults() {
  const { host } = useParams();
  const { data: result, isLoading, error } = useResult(host);

  document.title = `Scan results for ${host} | HTTP Observatory | MDN`;

  const hasData = host && result;

  return (
    <div className="observatory-results">
      <Container extraClasses="observatory-wrapper">
        <section className="header">
          <section className="heading-and-actions">
            <h1>
              <span className="accent">MDN Observatory</span> Report
            </h1>
            <section className="actions">
              <Button href="../">Scan another site</Button>
            </section>
          </section>
          {hasData ? (
            <ObservatoryRating result={result} host={host} />
          ) : isLoading ? (
            <Loading />
          ) : (
            <NoteCard type="error">
              <h4>Error</h4>
              <p>{error ? error.message : "An error occurred."}</p>
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
  const tabs = [
    <ObservatoryTests result={result} />,
    <ObservatoryCSP result={result} />,
    <ObservatoryHeaders result={result} />,
    <ObservatoryCookies result={result} />,
    <ObservatoryHistory result={result} />,
  ];
  const [selectedTab, setSelectedTab] = useState(1);

  return (
    <>
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
        {tabs.map((tabElement, i) => {
          return (
            <li id={`tabs-${i}`} className="tabs-item" key={`ti-${i}`}>
              <input
                className="visually-hidden"
                id={`tab-${i}`}
                name="selected"
                type="radio"
                checked={i === selectedTab}
                onChange={() => setSelectedTab(i)}
              />
              <label htmlFor={`tab-${i}`}>tab-{i}</label>
              {tabElement}
            </li>
          );
        })}
      </ol>
    </>
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
      return <div className="trend">no change since last scan</div>;
    }
  }
}

function ObservatoryRating({
  result,
  host,
}: {
  result: ObservatoryResult;
  host: string;
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
        Scan summary: <span className="host">{host}</span>
      </h2>
      <section className="scan-result">
        <section className="grade-trend">
          <div className="overall">
            <span className="accent">Grade: </span>
            <div
              className={`grade grade-${result.scan.grade?.[0]?.toLowerCase()}`}
            >
              {result.scan.grade}
            </div>
          </div>
          {trend(result)}
        </section>
        <section className="score">
          <span className="accent">Score:</span> {result.scan.score}/100
        </section>
        <section className="scan-time">
          <span className="accent">Scan Time: </span>
          {new Date(result.scan.scanned_at).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "medium",
          })}
        </section>
      </section>
    </>
  );
}

function ObservatoryTests({ result }: { result: ObservatoryResult }) {
  return Object.keys(result.tests).length !== 0 ? (
    <>
      <figure className="scroll-container">
        <table className="fancy tests">
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
                    <Link href={test.link}>{test.name}</Link>
                  </td>
                  {[
                    "referrer-policy-not-implemented",
                    "referrer-policy-no-referrer-when-downgrade",
                    "sri-not-implemented-response-not-html",
                    "sri-not-implemented-but-no-scripts-loaded",
                    "sri-not-implemented-but-all-scripts-loaded-from-secure-origin",
                    "cookies-not-found",
                  ].includes(test.result) ? (
                    <td>-</td>
                  ) : (
                    <td>
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
                      __html: test.recommendation,
                    }}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </figure>
    </>
  ) : null;
}

function ObservatoryHistory({ result }: { result: ObservatoryResult }) {
  return result.history.length ? (
    <>
      <h2>Grade History</h2>
      <figure className="scroll-container">
        <table className="fancy">
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
    </>
  ) : null;
}

function ObservatoryCookies({ result }: { result: ObservatoryResult }) {
  const cookies = result.tests["cookies"]?.data;
  return cookies && Object.keys(cookies).length !== 0 ? (
    <>
      <h2>Cookies</h2>
      <figure className="scroll-container">
        <table className="fancy cookies">
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
                  {new Date(value.expires * 1000).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td>
                  <code>{value.path}</code>
                </td>
                <td>
                  <Icon name={value.secure ? "check-circle" : "alert-circle"} />
                  <span className="visually-hidden">
                    {value.secure ? "True" : "False"}
                  </span>
                </td>
                <td>
                  <Icon
                    name={value.httponly ? "check-circle" : "alert-circle"}
                  />
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
                      <>
                        <Icon name={x ? "check-circle" : "alert-circle"} />
                        <span className="visually-hidden">
                          {x ? "True" : "False"}
                        </span>
                      </>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </>
  ) : (
    []
  );
}

function ObservatoryHeaders({ result }: { result: ObservatoryResult }) {
  return result.scan.response_headers ? (
    <>
      <h2>Raw Server Headers</h2>
      <figure className="scroll-container">
        <table className="fancy headers">
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
                  <td>{header}</td>
                  <td>{value}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </figure>
    </>
  ) : null;
}
