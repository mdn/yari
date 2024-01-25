import { ObservatoryResult } from "./types";
import { useParams } from "react-router";
import ObservatoryRecommendations from "./recommendations";
import { Icon } from "../ui/atoms/icon";
import { SidePlacement } from "../ui/organisms/placement";
import { Loading } from "../ui/atoms/loading";
import NoteCard from "../ui/molecules/notecards";
import { useResult } from ".";
import { InfoTooltip } from "../document/molecules/tooltip";
import ObservatoryCSP from "./csp";

const TEST_MAP: Record<string, { name?: string; url: string; info: string }> = {
  "content-security-policy": {
    name: "Content Security Policy",
    url: "https://infosec.mozilla.org/guidelines/web_security#content-security-policy",
    info: "Content Security Policy (CSP) can prevent a wide range of cross-site scripting (XSS) and clickjacking attacks against your website.",
  },
  contribute: {
    name: "Contribute.json",
    url: "https://infosec.mozilla.org/guidelines/web_security#contributejson",
    info: "Having a contribute.json file on the root your website allows Mozilla's information security team to more quickly triage incoming security bugs.",
  },
  cookies: {
    url: "https://infosec.mozilla.org/guidelines/web_security#cookies",
    info: "Using cookies attributes such as Secure and HttpOnly can protect users from having their personal information stolen.",
  },
  "cross-origin-resource-sharing": {
    name: "Cross-origin Resource Sharing",
    url: "https://infosec.mozilla.org/guidelines/web_security#cross-origin-resource-sharing",
    info: "Incorrectly configured CORS settings can allow foreign sites to read your site's contents, possibly allowing them access to private user information.",
  },
  redirection: {
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
    url: "https://infosec.mozilla.org/guidelines/web_security#x-content-type-options",
    info: "X-Content-Type-Options instructs browsers to not guess the MIME types of files that the web server is delivering.",
  },
  "x-frame-options": {
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

  document.title = `Scan results for ${host} | Observatory | MDN`;

  return (
    <div className="observatory-results">
      <h1>Security Report Summary</h1>
      {host && result ? (
        <>
          <ObservatoryRating result={result} host={host} />
          <SidePlacement />
          <ObservatoryRecommendations result={result} host={host} />
          <ObservatoryTests result={result} />
          <ObservatoryCSP result={result} />
          <ObservatoryHistory result={result} />
          <ObservatoryCookies result={result} />
          <ObservatoryHeaders result={result} />
        </>
      ) : isLoading ? (
        <Loading />
      ) : (
        <NoteCard type="error">
          <h4>Error</h4>
          <p>{error ? error.message : "An error occurred."}</p>
        </NoteCard>
      )}
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
      <h2>Overall Rating</h2>
      <table className="overall">
        <thead>
          <tr>
            <th>Grade</th>
            <th>Score</th>
            <th>Tests Passed</th>
            <th>Scan Time</th>
            <th>Website</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div
                className={`grade grade-${result.scan.grade[0]?.toLowerCase()}`}
              >
                {result.scan.grade}
              </div>
              {/* {["a", "b", "c", "d", "e", "f"].map(grade => <><div className={`grade grade-${grade[0]}`}>
                {grade.toUpperCase()}
              </div></>)} */}
            </td>
            <td>{result.scan.score}/100</td>
            <td>
              {result.scan.tests_passed}/{result.scan.tests_quantity}
            </td>
            <td>
              {new Date(result.scan.end_time).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "medium",
              })}
            </td>
            <td>{host}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function ObservatoryTests({ result }: { result: ObservatoryResult }) {
  return Object.keys(result.tests).length !== 0 ? (
    <>
      <h2>Test Scores</h2>
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
            .filter(
              ([_, test]) =>
                ![
                  "contribute-json-only-required-on-mozilla-properties",
                  "x-xss-protection-enabled-mode-block",
                  "x-xss-protection-disabled",
                  "x-xss-protection-not-implemented",
                ].includes(test.result)
            )
            .sort(([aName], [bName]) =>
              (TEST_MAP[aName]?.name || aName).localeCompare(
                TEST_MAP[bName]?.name || bName,
                undefined,
                { sensitivity: "base" }
              )
            )
            .map(([name, test]) =>
              TEST_MAP[name] ? (
                <tr key={name}>
                  <td>
                    <a href={TEST_MAP[name]?.url}>
                      {TEST_MAP[name]?.name ||
                        name
                          .split("-")
                          .map((x) => x[0]?.toUpperCase() + x.slice(1))
                          .join("-")}
                    </a>
                  </td>
                  <td>
                    <Icon name={test.pass ? "check-circle" : "alert-circle"} />
                    <span className="visually-hidden">
                      {test.pass ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td>{test.score_modifier}</td>
                  <td>{test.score_description}</td>
                  <td>
                    {TEST_MAP[name]?.info && (
                      <InfoTooltip>{TEST_MAP[name]?.info}</InfoTooltip>
                    )}
                  </td>
                </tr>
              ) : null
            )}
        </tbody>
      </table>
    </>
  ) : null;
}

function ObservatoryHistory({ result }: { result: ObservatoryResult }) {
  return result.history.length ? (
    <>
      <h2>Grade History</h2>
      <table className="fancy">
        <thead>
          <tr>
            <th>Date</th>
            <th>Score</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {[...result.history].reverse().map(({ end_time, score, grade }) => (
            <tr key={end_time}>
              <td>
                {new Date(end_time).toLocaleString([], {
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
    </>
  ) : null;
}

function ObservatoryCookies({ result }: { result: ObservatoryResult }) {
  const cookies = result.tests["cookies"]?.data;
  return cookies && Object.keys(cookies).length !== 0 ? (
    <>
      <h2>Cookies</h2>
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
                <Icon name={value.httponly ? "check-circle" : "alert-circle"} />
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
    </>
  ) : (
    []
  );
}

function ObservatoryHeaders({ result }: { result: ObservatoryResult }) {
  return (
    <>
      <h2>Raw Server Headers</h2>
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
    </>
  );
}
