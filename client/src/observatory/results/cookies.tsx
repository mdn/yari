import { ObservatoryResult } from "../types";
import { formatDateTime, PassIcon } from "../utils";

export function ObservatoryCookies({ result }: { result: ObservatoryResult }) {
  const cookies = result.tests["cookies"]?.data;
  return cookies && Object.keys(cookies).length !== 0 ? (
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
                ? formatDateTime(new Date(value.expires))
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
                .map((x) => x.startsWith("__Host") || x.startsWith("__Secure"))
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
  ) : (
    <table className="cookies">
      <tbody>
        <tr>
          <td>No cookies detected</td>
        </tr>
      </tbody>
    </table>
  );
}
