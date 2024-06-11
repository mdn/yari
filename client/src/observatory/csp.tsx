import { InfoTooltip } from "../document/molecules/tooltip";
import { Icon } from "../ui/atoms/icon";
import { ObservatoryResult } from "./types";

export default function ObservatoryCSP({
  result,
}: {
  result: ObservatoryResult;
}) {
  const policy = result.tests["content-security-policy"]?.policy;
  return policy ? (
    <section className="tab-content">
      <figure className="scroll-container">
        <table className="fancy csp">
          <thead>
            <tr>
              <th>Test</th>
              <th>Pass</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Blocks execution of inline JavaScript by not allowing{" "}
                <code>'unsafe-inline'</code> inside <code>script-src</code>
              </td>
              <td>
                <Icon
                  name={!policy.unsafeInline ? "check-circle" : "alert-circle"}
                />
                <span className="visually-hidden">
                  {!policy.unsafeInline ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  Blocking the execution of inline JavaScript provides CSP's
                  strongest protection against cross-site scripting attacks.
                  Moving JavaScript to external files can also help make your
                  site more maintainable.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>
                Blocks execution of JavaScript's <code>eval()</code> function by
                not allowing <code>'unsafe-eval'</code> inside{" "}
                <code>script-src</code>
              </td>
              <td>
                <Icon
                  name={!policy.unsafeEval ? "check-circle" : "alert-circle"}
                />
                <span className="visually-hidden">
                  {!policy.unsafeEval ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  Blocking the use of JavaScript's <code>eval()</code> function
                  can help prevent the execution of untrusted code.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>
                Blocks execution of plug-ins, using <code>object-src</code>{" "}
                restrictions
              </td>
              <td>
                <Icon
                  name={!policy.unsafeObjects ? "check-circle" : "alert-circle"}
                />
                <span className="visually-hidden">
                  {!policy.unsafeObjects ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  Blocking the execution of plug-ins via{" "}
                  <code>object-src 'none'</code> or as inherited from{" "}
                  <code>default-src</code> can prevent attackers from loading
                  Flash or Java in the context of your page.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>
                Blocks inline styles by not allowing{" "}
                <code>'unsafe-inline'</code> inside <code>style-src</code>
              </td>
              <td>
                <Icon
                  name={
                    !policy.unsafeInlineStyle ? "check-circle" : "alert-circle"
                  }
                />
                <span className="visually-hidden">
                  {!policy.unsafeInlineStyle ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  Blocking inline styles can help prevent attackers from
                  modifying the contents or appearance of your page. Moving
                  styles to external stylesheets can also help make your site
                  more maintainable.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>Blocks loading of active content over HTTP or FTP</td>
              <td>
                <Icon
                  name={
                    !policy.insecureSchemeActive
                      ? "check-circle"
                      : "alert-circle"
                  }
                />
                <span className="visually-hidden">
                  {!policy.insecureSchemeActive ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  Loading JavaScript or plugins can allow a man-in-the-middle to
                  execute arbitrary code or your website. Restricting your
                  policy and changing links to HTTPS can help prevent this.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>Blocks loading of passive content over HTTP or FTP</td>
              <td>
                <Icon
                  name={
                    !policy.insecureSchemePassive
                      ? "check-circle"
                      : "alert-circle"
                  }
                />
                <span className="visually-hidden">
                  {!policy.insecureSchemePassive ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  This site's Content Security Policy allows the loading of
                  passive content such as images or videos over insecure
                  protocols such as HTTP or FTP. Consider changing them to load
                  them over HTTPS.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>
                Clickjacking protection, using <code>frame-ancestors</code>
              </td>
              <td>
                <Icon
                  name={
                    policy.antiClickjacking ? "check-circle" : "alert-circle"
                  }
                />
                <span className="visually-hidden">
                  {policy.antiClickjacking ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  The use of CSP's <code>frame-ancestors</code> directive offers
                  fine-grained control over who can frame your site.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>
                Deny by default, using <code>default-src 'none'</code>
              </td>
              <td>
                <Icon
                  name={policy.defaultNone ? "check-circle" : "alert-circle"}
                />
                <span className="visually-hidden">
                  {policy.defaultNone ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  Denying by default using <code>default-src 'none'</code>can
                  ensure that your Content Security Policy doesn't allow the
                  loading of resources you didn't intend to allow.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>
                Restricts use of the <code>&lt;base&gt;</code> tag by using{" "}
                <code>base-uri 'none'</code>, <code>base-uri 'self'</code>, or
                specific origins
              </td>
              <td>
                <Icon
                  name={
                    !policy.insecureBaseUri ? "check-circle" : "alert-circle"
                  }
                />
                <span className="visually-hidden">
                  {!policy.insecureBaseUri ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  The <code>base</code> tag can be used to trick your site into
                  loading scripts from untrusted origins.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>
                Restricts where <code>&lt;form&gt;</code> contents may be
                submitted by using <code>form-action 'none'</code>,{" "}
                <code>form-action 'self'</code>, or specific URIs
              </td>
              <td>
                <Icon
                  name={
                    !policy.insecureFormAction ? "check-circle" : "alert-circle"
                  }
                />
                <span className="visually-hidden">
                  {!policy.insecureFormAction ? "Passed" : "Failed"}
                </span>
              </td>
              <td>
                <InfoTooltip>
                  Malicious JavaScript or content injection could modify where
                  sensitive form data is submitted to or create additional forms
                  for data exfiltration.
                </InfoTooltip>
              </td>
            </tr>
            <tr>
              <td>
                Uses CSP3's <code>'strict-dynamic'</code> directive to allow
                dynamic script loading (optional)
              </td>
              {policy.strictDynamic ? (
                <td>
                  <Icon name="check-circle" />
                  <span className="visually-hidden">"Passed"</span>
                </td>
              ) : (
                <td>-</td>
              )}
              <td>
                <InfoTooltip>
                  <code>'strict-dynamic'</code> lets you use a JavaScript shim
                  loader to load all your site's JavaScript dynamically, without
                  having to track <code>script-src</code> origins.
                </InfoTooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </figure>
    </section>
  ) : null;
}
