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
  return policy ? (
    <section className="tab-content">
      <figure className="scroll-container">
        <table className="csp">
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
                    dangerouslySetInnerHTML={{
                      __html: policy[pt].description,
                    }}
                  />
                  <td>
                    <PassIcon pass={!policy[pt].pass} />
                    <span className="visually-hidden">
                      {!policy[pt].PassIcon ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td
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
      </figure>
    </section>
  ) : (
    <section className="tab-content">
      <figure className="scroll-container">
        <table className="csp">
          <thead>
            <tr>
              <th>No CSP headers detected</th>
            </tr>
          </thead>
        </table>
      </figure>
    </section>
  );
}
