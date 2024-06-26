import { ObservatoryResult } from "../types";
import { formatDateTime, PassIcon } from "../utils";

export function ObservatoryCookies({ result }: { result: ObservatoryResult }) {
  const cookies = result.tests["cookies"]?.data;
  return cookies && Object.keys(cookies).length !== 0 ? (
    <table className="cookies">
      <thead>
        <tr>
          <th>Name</th>
          <th>
            <a
              target="_blank"
              href="/en-US/docs/Web/Security/Practical_implementation_guides/Cookies#expires"
            >
              Expires
            </a>
          </th>
          <th>
            <a
              target="_blank"
              href="/en-US/docs/Web/Security/Practical_implementation_guides/Cookies#path"
            >
              Path
            </a>
          </th>
          <th>
            <a
              target="_blank"
              href="/en-US/docs/Web/Security/Practical_implementation_guides/Cookies#secure"
            >
              Secure
            </a>
          </th>
          <th>
            <a
              target="_blank"
              href="/en-US/docs/Web/Security/Practical_implementation_guides/Cookies#httponly"
            >
              HttpOnly
            </a>
          </th>
          <th>
            <a
              target="_blank"
              href="/en-US/docs/Web/Security/Practical_implementation_guides/Cookies#samesite"
            >
              SameSite
            </a>
          </th>
          <th>
            <a
              target="_blank"
              href="/en-US/docs/Web/Security/Practical_implementation_guides/Cookies#name"
            >
              Prefix
            </a>
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(cookies).map(([key, value]) => (
          <tr key={key}>
            <td data-header="Name" className="cookie-name">
              {key}
            </td>
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
            </td>
            <td data-header="HttpOnly">
              <PassIcon pass={value.httponly} />
            </td>
            <td data-header="SameSite">
              {value.samesite ? <code>{capitalize(value.samesite)}</code> : "-"}
            </td>
            <td data-header="Prefixed">
              <CookiePrefix name={key} />
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

function capitalize(input: string) {
  return input
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.substring(1) : ""))
    .join("-");
}

function CookiePrefix({ name }: { name: string }) {
  if (name.startsWith("__Host")) {
    return <code>Host</code>;
  } else if (name.startsWith("__Secure")) {
    return <code>Secure</code>;
  } else {
    return <>-</>;
  }
}
