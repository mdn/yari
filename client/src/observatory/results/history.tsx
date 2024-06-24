import { ObservatoryResult } from "../types";
import { formatDateTime, formatMinus } from "../utils";

export function ObservatoryHistory({ result }: { result: ObservatoryResult }) {
  return result.history.length ? (
    <table className="history">
      <thead>
        <tr>
          <th>Date</th>
          <th>Score</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        {[...result.history].reverse().map(({ scanned_at, score, grade }) => (
          <tr key={scanned_at}>
            <td data-header="Date">{formatDateTime(new Date(scanned_at))}</td>
            <td data-header="Score">{score}</td>
            <td data-header="Grade">{formatMinus(grade)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : null;
}
