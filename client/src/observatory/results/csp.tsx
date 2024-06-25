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

  return (
    <table className="csp">
      {policy ? (
        <>
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
        </>
      ) : (
        <tbody>
          <tr>
            <td>No CSP headers detected</td>
          </tr>
        </tbody>
      )}
    </table>
  );
}
