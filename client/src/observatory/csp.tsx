import { ObservatoryResult } from "./types";
import { PassIcon } from "./utils";

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
  return (
    <table className="csp">
      {policy ? (
        <>
          <thead>
            <tr>
              <th>Test</th>
              <th>Pass</th>
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
                    <PassIcon pass={!policy[pt].pass} />
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
