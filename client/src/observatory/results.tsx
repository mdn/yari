import { ObservatoryResult } from "./types";
import { useParams } from "react-router";
import ObservatoryRecommendations, { RECOMMENDATIONS } from "./recommendations";
import { Icon } from "../ui/atoms/icon";
import { SidePlacement } from "../ui/organisms/placement";
import { Loading } from "../ui/atoms/loading";
import NoteCard from "../ui/molecules/notecards";
import { useResult } from ".";
import { InfoTooltip } from "../document/molecules/tooltip";
import ObservatoryCSP from "./csp";
import { Link } from "./utils";
import Container from "../ui/atoms/container";
import { Button } from "../ui/atoms/button";

const TEST_MAP: Record<string, { name: string; url: string; info: string }> = {
  "content-security-policy": {
    name: "Content Security Policy",
    url: "https://infosec.mozilla.org/guidelines/web_security#content-security-policy",
    info: "Content Security Policy (CSP) can prevent a wide range of cross-site scripting (XSS) and clickjacking attacks against your website.",
  },
  cookies: {
    name: "Cookies",
    url: "https://infosec.mozilla.org/guidelines/web_security#cookies",
    info: "Using cookies attributes such as Secure and HttpOnly can protect users from having their personal information stolen.",
  },
  "cross-origin-resource-sharing": {
    name: "Cross-origin Resource Sharing",
    url: "https://infosec.mozilla.org/guidelines/web_security#cross-origin-resource-sharing",
    info: "Incorrectly configured CORS settings can allow foreign sites to read your site's contents, possibly allowing them access to private user information.",
  },
  redirection: {
    name: "Redirection",
    url: "https://infosec.mozilla.org/guidelines/web_security#http-redirections",
    info: "Properly configured redirections from HTTP to HTTPS allow browsers to correctly apply HTTP Strict Transport Security (HSTS) settings.",
  },
  "referrer-policy": {
    name: "Referrer Policy",
    url: "https://infosec.mozilla.org/guidelines/web_security#referrer-policy",
    info: "Referrer Policy can protect the privacy of your users by restricting the contents of the HTTP Referer header.",
  },
  "strict-transport-security": {
    name: "HTTP Strict Transport Security",
    url: "https://infosec.mozilla.org/guidelines/web_security#http-strict-transport-security",
    info: "HTTP Strict Transport Security (HSTS) instructs web browsers to visit your site only over HTTPS.",
  },
  "subresource-integrity": {
    name: "Subresource Integrity",
    url: "https://infosec.mozilla.org/guidelines/web_security#subresource-integrity",
    info: "Subresource Integrity protects against JavaScript files and stylesheets stored on content delivery networks (CDNs) from being maliciously modified.",
  },
  "x-content-type-options": {
    name: "X-Content-Type-Options",
    url: "https://infosec.mozilla.org/guidelines/web_security#x-content-type-options",
    info: "X-Content-Type-Options instructs browsers to not guess the MIME types of files that the web server is delivering.",
  },
  "x-frame-options": {
    name: "X-Frame-Options",
    url: "https://infosec.mozilla.org/guidelines/web_security#x-frame-options",
    info: "X-Frame-Options controls whether your site can be framed, protecting against clickjacking attacks. It has been superseded by Content Security Policy's frame-ancestors directive, but should still be used for now.",
  },
  "x-xss-protection": {
    name: "X-XSS-Protection",
    url: "https://infosec.mozilla.org/guidelines/web_security.html#x-xss-protection",
    info: "X-XSS-Protection protects against reflected cross-site scripting (XSS) attacks in IE and Chrome, but has been superseded by Content Security Policy. It can still be used to protect users of older web browsers.",
  },
};

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
            <h1>HTTP Observatory Report</h1>
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
            <ObservatoryRecommendations result={result} host={host} />
            <ObservatoryTests result={result} />
            <ObservatoryCSP result={result} />
            <ObservatoryHistory result={result} />
            <ObservatoryCookies result={result} />
            <ObservatoryHeaders result={result} />
          </section>
        )}
        <SidePlacement />
      </Container>
    </div>
  );
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
        Scan results for <span className="host">{host}</span>
      </h2>
      <figure className="scroll-container">
        <table className="overall">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Score</th>
              <th>Tests Passed</th>
              <th>Scan Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div
                  className={`grade grade-${result.scan.grade?.[0]?.toLowerCase()}`}
                >
                  {result.scan.grade}
                </div>
              </td>
              <td>{result.scan.score}/100</td>
              <td>
                {result.scan.tests_passed}/{result.scan.tests_quantity}
              </td>
              <td>
                {new Date(result.scan.scanned_at).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "medium",
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </figure>
    </>
  );
}

function ObservatoryTests({ result }: { result: ObservatoryResult }) {
  return Object.keys(result.tests).length !== 0 ? (
    <>
      <h2>Test Scores</h2>
      <figure className="scroll-container">
        <table className="fancy tests">
          <thead>
            <tr>
              <th>Test</th>
              <th>Result</th>
              <th>Impact</th>
              <th>Details</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(result.tests)
              .sort(
                (
                  [aName, { result: aResult, score_modifier: aScore }],
                  [bName, { result: bResult, score_modifier: bScore }]
                ) => {
                  const aIndex = RECOMMENDATIONS.findIndex(([results]) =>
                    results.includes(aResult)
                  );
                  const bIndex = RECOMMENDATIONS.findIndex(([results]) =>
                    results.includes(bResult)
                  );
                  const scoreDiff = aScore - bScore;
                  // sort by order in RECOMMENDATIONS
                  return aIndex !== -1 && bIndex !== -1
                    ? aIndex - bIndex
                    : aIndex !== -1
                      ? -1
                      : bIndex !== -1
                        ? 1
                        : // then by score
                          scoreDiff !== 0
                          ? scoreDiff
                          : // then by test name
                            (TEST_MAP[aName]?.name || aName).localeCompare(
                              TEST_MAP[bName]?.name || bName,
                              undefined,
                              { sensitivity: "base" }
                            );
                }
              )
              .map(([name, test]) => {
                const mappedTest = TEST_MAP[name];
                return mappedTest ? (
                  <tr key={name}>
                    <td>
                      <Link href={mappedTest.url}>{mappedTest.name}</Link>
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
                        <Icon
                          name={test.pass ? "check-circle" : "alert-circle"}
                        />
                        <span className="visually-hidden">
                          {test.pass ? "Passed" : "Failed"}
                        </span>
                      </td>
                    )}
                    <td>{test.score_modifier}</td>
                    <td>{test.score_description}</td>
                    <td>
                      {mappedTest.info && (
                        <InfoTooltip>{mappedTest.info}</InfoTooltip>
                      )}
                    </td>
                  </tr>
                ) : null;
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
