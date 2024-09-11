import useSWRImmutable from "swr/immutable";

import { ObservatoryResult } from "../types";

export function ObservatoryHeaders({ result }: { result: ObservatoryResult }) {
  return result.scan.response_headers ? (
    <table className="headers">
      <thead>
        <tr>
          <th>Header</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(result.scan.response_headers).map(([header, value]) => (
          <tr key={header}>
            <td data-header="Header">
              <HeaderLink header={header} />
            </td>
            <td data-header="Value">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
