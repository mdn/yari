import { ObservatoryResult } from "./types";
import useSWRImmutable from "swr/immutable";
import { useParams } from "react-router";
import ObservatoryRecommendations from "./recommendations";
import { Icon } from "../ui/atoms/icon";
import { SidePlacement } from "../ui/organisms/placement";
import { Loading } from "../ui/atoms/loading";
import NoteCard from "../ui/molecules/notecards";
import { useResult } from ".";

const TEST_MAP: Record<string, { name?: string; url: string }> = {
  "content-security-policy": {
    name: "Content Security Policy",
    url: "https://infosec.mozilla.org/guidelines/web_security#content-security-policy",
  },
  contribute: {
    name: "Contribute.json",
    url: "https://infosec.mozilla.org/guidelines/web_security#contributejson",
  },
  cookies: {
    url: "https://infosec.mozilla.org/guidelines/web_security#cookies",
  },
  "cross-origin-resource-sharing": {
    name: "Cross-origin Resource Sharing",
    url: "https://infosec.mozilla.org/guidelines/web_security#cross-origin-resource-sharing",
  },
  "public-key-pinning": {
    name: "HTTP Public Key Pinning",
    url: "https://infosec.mozilla.org/guidelines/web_security#http-public-key-pinning",
  },
  redirection: {
    url: "https://infosec.mozilla.org/guidelines/web_security#http-redirections",
  },
  "referrer-policy": {
    name: "Referrer Policy",
    url: "https://infosec.mozilla.org/guidelines/web_security#referrer-policy",
  },
  "strict-transport-security": {
    name: "HTTP Strict Transport Security",
    url: "https://infosec.mozilla.org/guidelines/web_security#http-strict-transport-security",
  },
  "subresource-integrity": {
    name: "Subresource Integrity",
    url: "https://infosec.mozilla.org/guidelines/web_security#subresource-integrity",
  },
  "x-content-type-options": {
    url: "https://infosec.mozilla.org/guidelines/web_security#x-content-type-options",
  },
  "x-frame-options": {
    url: "https://infosec.mozilla.org/guidelines/web_security#x-frame-options",
  },
  "x-xss-protection": {
    name: "X-XSS-Protection",
    url: "https://infosec.mozilla.org/guidelines/web_security.html#x-xss-protection",
  },
};

export default function ObservatoryResults() {
  const { host } = useParams();
  const { data: result, isLoading, error } = useResult(host);

  return (
    <div className="observatory-results">
      <h1>Security Report Summary</h1>
      {host && result ? (
        <>
          <ObservatoryRating result={result} host={host} />
          <SidePlacement />
          <ObservatoryRecommendations result={result} host={host} />
          <ObservatoryTests result={result} />
          <ObservatoryHistory result={result} />
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
                className={`grade grade-${result.scan.grade[0].toLowerCase()}`}
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
  return (
    <>
      <h2>Test Scores</h2>
      <table className="fancy tests">
        <thead>
          <tr>
            <th>Test</th>
            <th>Result</th>
            <th>Impact</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(result.tests)
            .filter(
              ([_, test]) =>
                test.result !==
                "contribute-json-only-required-on-mozilla-properties"
            )
            .sort(([aName], [bName]) =>
              (TEST_MAP[aName]?.name || aName).localeCompare(
                TEST_MAP[bName]?.name || bName,
                undefined,
                { sensitivity: "base" }
              )
            )
            .map(([name, test]) => (
              <tr key={name}>
                <td>
                  <a href={TEST_MAP[name]?.url}>
                    {TEST_MAP[name]?.name ||
                      name
                        .split("-")
                        .map((x) => x[0].toUpperCase() + x.slice(1))
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
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
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
