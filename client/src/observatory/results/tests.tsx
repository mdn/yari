import { ObservatoryResult } from "../types";
import { formatMinus, Link, PassIcon } from "../utils";

export function ObservatoryTests({ result }: { result: ObservatoryResult }) {
  return Object.keys(result.tests).length !== 0 ? (
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
                      {formatMinus(`${test.score_modifier}`)}
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
                  __html: test.recommendation || `<p class="obs-none">None</p>`,
                }}
              />
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : null;
}
