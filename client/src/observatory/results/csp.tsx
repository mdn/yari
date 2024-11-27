import { ObservatoryResult } from "../types";
import { PassIcon } from "../utils";

const policyTests = [
  "unsafeInline",
  "unsafeEval",
  "unsafeObjects",
  "unsafeInlineStyle",
  "insecureSchemeActive",
  "insecureSchemePassive",
  "antiClickjacking",
  "defaultNone",
  "insecureBaseUri",
  "insecureFormAction",
  "strictDynamic",
];

export default function ObservatoryCSP({
  result,
}: {
  result: ObservatoryResult;
}) {
  const policy = result.tests["content-security-policy"]?.policy;

  // Awkward, but so it has been on python-observatory:
  // Negate some of the `pass` flags because sometimes
  // a `pass` on the policy is bad, and sometimes not.
  const negatedPolicies = [
    "insecureBaseUri",
    "insecureFormAction",
    "insecureSchemeActive",
    "insecureSchemePassive",
    "unsafeEval",
    "unsafeInline",
    "unsafeInlineStyle",
    "unsafeObjects",
  ];

  // cookies && Object.keys(cookies).length !== 0 ?
  return policy ? (
    <>
      <div className="detail-header">
        <div>
          <p className="arrow">→</p>
        </div>
        <div
          className="detail-header-content"
          dangerouslySetInnerHTML={{
            __html:
              result.tests["content-security-policy"]?.score_description ??
              `<p class="obs-none">None</p>`,
          }}
        />
      </div>

      <table className="csp">
        <thead>
          <tr>
            <th>Test</th>
            <th>Result</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {policyTests.map((pt) => {
            return policy[pt] ? (
              <tr key={policy[pt].description}>
                <td
                  data-header="Test"
                  dangerouslySetInnerHTML={{
                    __html: policy[pt].description,
                  }}
                />
                <td data-header="Pass">
                  <PassIcon
                    pass={
                      negatedPolicies.includes(pt)
                        ? !policy[pt].pass
                        : policy[pt].pass
                    }
                  />
                </td>
                <td
                  data-header="Info"
                  dangerouslySetInnerHTML={{
                    __html: policy[pt].info,
                  }}
                ></td>
              </tr>
            ) : (
              []
            );
          })}
        </tbody>
      </table>
    </>
  ) : result.tests["content-security-policy"]?.result ===
    "csp-not-implemented-but-reporting-enabled" ? (
    <table className="csp">
      <tbody>
        <tr>
          <td>
            <p>
              <code>Content-Security-Policy-Report-Only</code> header detected.
              Implement an enforced policy; see{" "}
              <a href="/en-US/docs/Web/HTTP/CSP" target="_blank">
                MDN's Content Security Policy (CSP) documentation
              </a>
              .
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  ) : (
    <table className="csp">
      <tbody>
        <tr>
          <td>
            <p>No CSP headers detected</p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
