import { useUpdateResult } from ".";
import { Button } from "../ui/atoms/button";
import { ObservatoryResult } from "./types";
import { Link } from "./utils";

export default function ObservatoryRecommendations({
  result,
  host,
}: {
  result: ObservatoryResult;
  host: string;
}) {
  const { trigger } = useUpdateResult(host);
  const tests = result.tests;
  return tests && Object.keys(tests).length !== 0 ? (
    <>
      <h2>Recommendation</h2>
      <figure className="scroll-container">
        <div id="recommendations" className="box">
          {[
            "cross-origin-resource-sharing-implemented-with-universal-access",
          ].includes(
            result.tests["cross-origin-resource-sharing"]?.result || ""
          ) && (
            <div className="recommendation">
              <p>
                Your site is configured with extremely broad resource sharing
                permissions.
              </p>
              <p>
                This can be dangerous, and is possibly not what was intended.
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/HTTP/CORS">
                    Cross-Origin Resource Sharing (CORS)
                  </Link>
                </li>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#cross-origin-resource-sharing">
                    Mozilla Web Security Guidelines (cross-origin resource
                    sharing)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {["hsts-not-implemented-no-https", "hsts-invalid-cert"].includes(
            result.tests["strict-transport-security"]?.result || ""
          ) && (
            <div className="recommendation">
              <p>Wondering where to start?</p>
              <p>
                Adding HTTPS protects your site's visitors from tracking,
                malware, and injected advertising.
              </p>
              <p>
                Many services providers and certificate authorities now provide
                free HTTPS and digital certificates to make this as painless as
                possible!
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/Security/Transport_Layer_Security">
                    Transport Layer Security
                  </Link>
                </li>
                <li>
                  <Link href="https://wiki.mozilla.org/Security/Server_Side_TLS">
                    Mozilla TLS Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="https://ssl-config.mozilla.org">
                    Mozilla TLS Configuration Generator
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {[
            "redirection-missing",
            "redirection-not-to-https",
            "redirection-invalid-cert",
          ].includes(result.tests["redirection"]?.result || "") && (
            <div className="recommendation">
              <p>
                We noticed that your site is accessible over HTTPS, but still
                defaults to HTTP.
              </p>
              <p>
                Automatically redirecting from HTTP to HTTPS helps ensure that
                your users get served a secure version of your site.
              </p>
              <ul>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#http-redirections">
                    Mozilla Web Security Guidelines (redirections)
                  </Link>
                </li>
                <li>
                  <Link href="https://ssl-config.mozilla.org">
                    Mozilla TLS Configuration Generator
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {[
            "hsts-implemented-max-age-less-than-six-months",
            "hsts-not-implemented",
            "hsts-header-invalid",
          ].includes(
            result.tests["strict-transport-security"]?.result || ""
          ) && (
            <div className="recommendation">
              <p>
                Fantastic work using HTTPS! Did you know that you can ensure
                users never visit your site over HTTP accidentally?
              </p>
              <p>
                HTTP Strict Transport Security tells web browsers to only access
                your site over HTTPS in the future, even if the user attempts to
                visit over HTTP or clicks an <code>http://</code> link.
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security">
                    Strict-Transport-Security
                  </Link>
                </li>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#http-strict-transport-security">
                    Mozilla Web Security Guidelines (HSTS)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {[
            "cookies-without-secure-flag-but-protected-by-hsts",
            "cookies-without-secure-flag",
            "cookies-session-without-httponly-flag",
            "cookies-session-without-secure-flag",
          ].includes(result.tests["cookies"]?.result || "") && (
            <div className="recommendation">
              <p>
                You're doing a great job with HTTPS and HTTP Strict Transport
                Security!
              </p>
              <p>
                Since you’re now only allowing connections over HTTPS, consider
                using the <code>Secure</code> flag to protect your cookies
                against their accidental transmission over HTTP. Furthermore,
                the use of <code>HttpOnly</code> protects your session cookies
                from malicious JavaScript.
              </p>
              <ul>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#cookies">
                    Mozilla Web Security Guidelines (cookies)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {[
            "x-frame-options-not-implemented",
            "x-frame-options-header-invalid",
          ].includes(result.tests["x-frame-options"]?.result || "") && (
            <div className="recommendation">
              <p>What’s a good next step?</p>
              <p>
                The use of the <code>X-Frame-Options</code> header and Content
                Security Policy’s <code>frame-ancestors</code> directive are a
                simple and easy way to protect your site against clickjacking
                attacks.
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors">
                    CSP: frame-ancestors
                  </Link>
                </li>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#x-frame-options">
                    Mozilla Web Security Guidelines (X-Frame-Options)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {[
            "x-content-type-options-not-implemented",
            "x-content-type-options-header-invalid",
          ].includes(result.tests["x-content-type-options"]?.result || "") && (
            <div className="recommendation">
              <p>You’re halfway finished! Nice job!</p>
              <p>
                The <code>X-Content-Type-Options</code> header tells browsers to
                stop automatically detecting the contents of files. This
                protects against attacks where they're tricked into incorrectly
                interpreting files as JavaScript.
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options">
                    X-Content-Type-Options
                  </Link>
                </li>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#x-content-type-options">
                    Mozilla Web Security Guidelines (X-Content-Type-Options)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {[
            "csp-implemented-with-unsafe-eval",
            "csp-implemented-with-insecure-scheme",
            "csp-implemented-with-unsafe-inline",
            "csp-not-implemented",
            "csp-header-invalid",
          ].includes(result.tests["content-security-policy"]?.result || "") && (
            <div className="recommendation">
              <p>You’re doing a wonderful job so far!</p>
              <p>
                Did you know that a strong Content Security Policy (CSP) policy
                can help protect your website against malicious cross-site
                scripting attacks?
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/HTTP/CSP">
                    Content Security Policy (CSP)
                  </Link>
                </li>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#content-security-policy">
                    Mozilla Web Security Guidelines (Content Security Policy)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {[
            "sri-not-implemented-but-external-scripts-loaded-securely",
          ].includes(result.tests["subresource-integrity"]?.result || "") && (
            <div className="recommendation">
              <p>
                We’ve noticed you’re using other domains to host your JavaScript
                code.
              </p>
              <p>
                Subresource Integrity guarantees that your site will stay safe
                even if one of those domains is compromised.
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/Security/Subresource_Integrity">
                    Subresource Integrity
                  </Link>
                </li>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#subresource-integrity">
                    Mozilla Web Security Guidelines (Subresource Integrity)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {[
            "referrer-policy-not-implemented",
            "referrer-policy-unsafe",
            "referrer-policy-headeer-invalid",
          ].includes(result.tests["referrer-policy"]?.result || "") && (
            <div className="recommendation">
              <p>You’re on the home stretch!</p>
              <p>
                The use of Referrer Policy can help protect the privacy of your
                users by restricting the information that browsers provide when
                accessing resources kept on other sites.
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/Security/Referer_header:_privacy_and_security_concerns">
                    Referer header: Privacy and security concerns
                  </Link>
                </li>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#referrer-policy">
                    Mozilla Web Security Guidelines (Referrer Policy)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {["csp-implemented-with-unsafe-inline-in-style-src-only"].includes(
            result.tests["content-security-policy"]?.result || ""
          ) && (
            <div className="recommendation">
              <p>Almost there!</p>
              <p>
                Your current CSP policy allows the use of{" "}
                <code>'unsafe-inline'</code> inside of <code>style-src</code>.
                Moving <code>style</code> attributes into external stylesheets
                not only makes you safer, but also makes your code easier to
                maintain.
              </p>
              <ul>
                <li>
                  <Link href="/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src#unsafe_inline_styles">
                    CSP: style-src &gt; Unsafe inline styles
                  </Link>
                </li>
                <li>
                  <Link href="https://infosec.mozilla.org/guidelines/web_security#content-security-policy">
                    Mozilla Web Security Guidelines (Content Security Policy)
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div className="recommendation">
            <p>
              <em>
                &#x1F389;&#x1F389;&#x1F389;&nbsp; We don't have any!
                &nbsp;&#x1F389;&#x1F389;&#x1F389;
              </em>
            </p>
            <p>
              Make sure to check back occasionally to ensure that your website
              is keeping up with the latest in web security standards.
            </p>
            <p>
              In the meantime, thanks for everything you're doing to keep the
              internet a safe, secure, and private place!
            </p>
          </div>
          <div className="rescan">
            <p>
              Once you've successfully completed your change, click Rescan for
              the next piece of advice.
            </p>
            <Button onClickHandler={() => trigger(result.scan.hidden)}>
              Rescan
            </Button>
          </div>
        </div>
      </figure>
    </>
  ) : (
    <>
      <figure className="scroll-container">
        <div id="recommendations" className="box">
          <div className="rescan">
            <p>
              Oops, it looks like we can't load these test results, you should
              Rescan.
            </p>
            <Button onClickHandler={() => trigger(result.scan.hidden)}>
              Rescan
            </Button>
          </div>
        </div>
      </figure>
    </>
  );
}
