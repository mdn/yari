---
title: Tests & Scoring
---

# HTTP Observatory Scoring Methodology

It is difficult to assign an objective value to a subjective question such as
"How bad is not implementing HTTP Strict Transport Security?" In addition, what
may be unnecessary for one site — such as implementing Content Security Policy —
might mitigate important risks for another. The scores and grades offered by the
Mozilla Observatory are designed to alert developers when they're not taking
advantage of the latest web security features. Individual developers will need
to determine which ones are appropriate for their sites.

This page outlines the scoring methodology and grading system Observatory uses,
before listing all of the specific tests along with their score modifiers.

## Scoring Methodology

All websites start with a baseline score of 100, which is then modified with
penalties and/or bonuses resulting from the tests. The scoring is done across
two rounds:

1. The baseline score has the penalty points deducted from it.
2. If the resulting score is 90 (A) or greater, the bonuses are then added to
   it. You can think of the bonuses as extra credit for going above and beyond
   the call of duty in defending your website.

Each site tested by Observatory is awarded a grade based on its final score
after the two rounds. The minimum score is 0, and the highest possible score in
the HTTP Observatory is currently 135.

## Grading Chart

| Scoring Range |     Grade     |
| :-----------: | :-----------: |
|     100+      |   &nbsp;A+    |
|     90-99     | &nbsp;A&nbsp; |
|     85-89     |   &nbsp;A-    |
|     80-84     |   &nbsp;B+    |
|     70-79     | &nbsp;B&nbsp; |
|     65-69     |   &nbsp;B-    |
|     60-64     |   &nbsp;C+    |
|     50-59     | &nbsp;C&nbsp; |
|     45-49     |   &nbsp;C-    |
|     40-44     |   &nbsp;D+    |
|     30-39     | &nbsp;D&nbsp; |
|     25-29     |   &nbsp;D-    |
|     0-24      | &nbsp;F&nbsp; |

The letter grade ranges and modifiers are essentially arbitrary, however, they
are based on feedback from industry professionals on how important passing or
failing a given test is likely to be.

## Tests and Score Modifiers

> **Note:** Over time, the modifiers may change as baselines shift or new
> cutting-edge defensive security technologies are created. The bonuses
> (positive modifiers) are specifically designed to encourage people to adopt
> new security technologies or tackle difficult implementation challenges.

## Content Security Policy (CSP)

See
[CSP configuration](/en-US/docs/Web/Security/Practical_implementation_guides/CSP)
for guidance.

| Test result                                                  | Description                                                                                                                                                                                                                                                     | Modifier |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| csp-implemented-with-no-unsafe-default-src-none              | Content Security Policy (CSP) implemented with `default-src 'none'`, no `unsafe` and form-action is set to `none` or `self`.                                                                                                                                    |    10    |
| csp-implemented-with-no-unsafe                               | Content Security Policy (CSP) implemented without `'unsafe-inline'` or `'unsafe-eval'`.                                                                                                                                                                         |    5     |
| csp-implemented-with-unsafe-inline-in-style-src-only         | Content Security Policy (CSP) implemented with unsafe sources inside style-src. This includes `'unsafe-inline'`, data: or overly broad sources such as `https`. `'form-action'` is set to `'self'`, `'none'` or `'specific source'`.                            |    0     |
| csp-implemented-with-insecure-scheme-in-passive-content-only | Content Security Policy (CSP) implemented, but secure site allows images or media to be loaded via HTTP.                                                                                                                                                        |   -10    |
| csp-implemented-with-unsafe-eval                             | Content Security Policy (CSP) implemented, but allows `'unsafe-eval'` and allows forms to be submitted to any source.                                                                                                                                           |   -10    |
| csp-implemented-with-unsafe-inline                           | Content Security Policy (CSP) implemented unsafely. This includes `'unsafe-inline'` or `data:` inside `script-src`, overly broad sources such as `https:` inside `object-src` or `script-src`, or not restricting the sources for `object-src` or `script-src`. |   -20    |
| csp-implemented-with-insecure-scheme                         | Content Security Policy (CSP) implemented, but secure site allows resources to be loaded via HTTP.                                                                                                                                                              |   -20    |
| csp-header-invalid                                           | Content Security Policy (CSP) header cannot be parsed successfully.                                                                                                                                                                                             |   -25    |
| csp-not-implemented                                          | Content Security Policy (CSP) header not implemented.                                                                                                                                                                                                           |   -25    |

## Cookies

See
[Secure cookie configuration](/en-US/docs/Web/Security/Practical_implementation_guides/Cookies)
for guidance.

| Test result                                               | Description                                                                                                                                     | Modifier |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| cookies-secure-with-httponly-sessions-and-samesite        | All cookies use the `Secure` flag, session cookies use the `HttpOnly` flag, and cross-origin restrictions are in place via the `SameSite` flag. |    5     |
| cookies-secure-with-httponly-sessions                     | All cookies use the `Secure` flag and all session cookies use the `HttpOnly` flag.                                                              |    0     |
| cookies-not-found                                         | No cookies detected.                                                                                                                            |    0     |
| cookies-without-secure-flag-but-protected-by-hsts         | Cookies set without using the `Secure` flag, but transmission via HTTP prevented by HSTS.                                                       |    -5    |
| cookies-session-without-secure-flag-but-protected-by-hsts | Session cookie set without the `Secure` flag, but transmission via HTTP prevented by HSTS.                                                      |   -10    |
| cookies-without-secure-flag                               | Cookies set without using the `Secure` flag or set via HTTP.                                                                                    |   -20    |
| cookies-samesite-flag-invalid                             | Cookies use the `SameSite` flag, but set to something other than `Strict` or `Lax`.                                                             |   -20    |
| cookies-anticsrf-without-samesite-flag                    | Anti-CSRF tokens set without using the `SameSite` flag.                                                                                         |   -20    |
| cookies-session-without-httponly-flag                     | Session cookie set without using the `HttpOnly` flag.                                                                                           |   -30    |
| cookies-session-without-secure-flag                       | Session cookie set without using the `Secure` flag or set via HTTP.                                                                             |   -40    |

## Cross-origin Resource Sharing (CORS)

See
[CORS configuration](/en-US/docs/Web/Security/Practical_implementation_guides/CORS)
for guidance.

| Test result                                                      | Description                                                                                                                                                  | Modifier |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| cross-origin-resource-sharing-not-implemented                    | Content is not visible via cross-origin resource sharing (CORS) files or headers.                                                                            |    0     |
| cross-origin-resource-sharing-implemented-with-public-access     | Public content is visible via cross-origin resource sharing (CORS) `Access-Control-Allow-Origin` header.                                                     |    0     |
| cross-origin-resource-sharing-implemented-with-restricted-access | Content is visible via cross-origin resource sharing (CORS) files or headers, but is restricted to specific domains.                                         |    0     |
| cross-origin-resource-sharing-implemented-with-universal-access  | Content is visible via cross-origin resource sharing (CORS) file or headers, and credentials can be sent. **Your site could be vulnerable to CSRF attacks**. |   -50    |

## Redirections

See
[Redirections](/en-US/docs/Web/Security/Practical_implementation_guides/TLS#http_redirections)
for guidance.

| Test result                                     | Description                                                                            | Modifier |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | :------: |
| redirection-all-redirects-preloaded             | All hosts redirected to are in the HTTP Strict Transport Security (HSTS) preload list. |    0     |
| redirection-to-https                            | Initial redirection is to HTTPS on the same host, final destination is HTTPS.          |    0     |
| redirection-not-needed-no-http                  | Not able to connect via HTTP, so no redirection necessary.                             |    0     |
| redirection-off-host-from-http                  | Initial redirection from HTTP to HTTPS is to a different host, preventing HSTS.        |    -5    |
| redirection-not-to-https-on-initial-redirection | Redirects to HTTPS eventually, but initial redirection is to another HTTP URL.         |   -10    |
| redirection-not-to-https                        | Redirects, but final destination is not an HTTPS URL.                                  |   -20    |
| redirection-missing                             | Does not redirect to an HTTPS site.                                                    |   -20    |
| redirection-invalid-cert                        | Invalid certificate chain encountered during redirection.                              |   -20    |

## Referrer Policy

See
[Referrer Policy](http://localhost:3000/en-US/docs/Web/Security/Practical_implementation_guides/Referrer_policy)
for guidance.

| Test result                     | Description                                                                                                                    | Modifier |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | :------: |
| referrer-policy-private         | `Referrer-Policy` header set to `no-referrer`, `same-origin`, `strict-origin`, or `strict-origin-when-cross-origin`.           |    5     |
| referrer-policy-not-implemented | `Referrer-Policy` header not implemented.                                                                                      |    0     |
| referrer-policy-unsafe          | `Referrer-Policy` header unsafely set to `origin`, `origin-when-cross-origin`, `unsafe-url` or `'no-referrer-when-downgrade'`. |    -5    |
| referrer-policy-header-invalid  | `Referrer-Policy` header cannot be recognized.                                                                                 |    -5    |

## HTTP Strict Transport Security (HSTS)

See
[Strict Transport Security configuration](/en-US/docs/Web/Security/Practical_implementation_guides/TLS#http_strict_transport_security)
for guidance.

| Test result                                   | Description                                                                                              | Modifier |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| hsts-preloaded                                | Preloaded via the HTTP Strict Transport Security (HSTS) preloading process.                              |    5     |
| hsts-implemented-max-age-at-least-six-months  | `Strict-Transport-Security` header set to a minimum of six months (15768000).                            |    0     |
| hsts-implemented-max-age-less-than-six-months | `Strict-Transport-Security` header set to less than six months (15768000).                               |   -10    |
| hsts-not-implemented                          | `Strict-Transport-Security` header not implemented.                                                      |   -20    |
| hsts-header-invalid                           | `Strict-Transport-Security` header cannot be recognized.                                                 |   -20    |
| hsts-not-implemented-no-https                 | `Strict-Transport-Security` header cannot be set for sites not available over HTTPS.                     |   -20    |
| hsts-invalid-cert                             | `Strict-Transport-Security` header cannot be set because the site contains an invalid certificate chain. |   -20    |

## Subresource Integrity

See [Subresource Integrity](/en-US/docs/Web/Security/Subresource_Integrity) for
guidance.

| Test result                                                   | Description                                                                                                                          | Modifier |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| sri-implemented-and-all-scripts-loaded-securely               | Subresource Integrity (SRI) is implemented and all scripts are loaded from a similar origin.                                         |    5     |
| sri-implemented-and-external-scripts-loaded-securely          | Subresource Integrity (SRI) is implemented and all scripts are loaded securely.                                                      |    5     |
| sri-not-implemented-response-not-html                         | Subresource Integrity (SRI) is only needed for HTML resources.                                                                       |    0     |
| sri-not-implemented-but-no-scripts-loaded                     | Subresource Integrity (SRI) is not needed since the site contains no `<script>` tags.                                                |    0     |
| sri-not-implemented-but-all-scripts-loaded-from-secure-origin | Subresource Integrity (SRI) not implemented as all scripts are loaded from a similar origin.                                         |    0     |
| sri-not-implemented-but-external-scripts-loaded-securely      | Subresource Integrity (SRI) not implemented, but all external scripts are loaded over HTTPS.                                         |    -5    |
| sri-implemented-but-external-scripts-not-loaded-securely      | Subresource Integrity (SRI) implemented, but external scripts are loaded over HTTP or use protocol-relative URLs via `src="//..."`   |   -20    |
| sri-not-implemented-and-external-scripts-not-loaded-securely  | Subresource Integrity (SRI) is not implemented, and are scripts are loaded over HTTP or use protocol-relative URLs via `src="//..."` |   -50    |

## X-Content-Type-Options

See
[X-Content-Type-Options](/en-US/docs/Web/Security/Practical_implementation_guides/MIME_types)
for guidance.

| Test result                            | Description                                           | Modifier |
| -------------------------------------- | ----------------------------------------------------- | :------: |
| x-content-type-options-nosniff         | `X-Content-Type-Options` header set to `nosniff`.     |    0     |
| x-content-type-options-not-implemented | `X-Content-Type-Options` header not implemented.      |    -5    |
| x-content-type-options-header-invalid  | `X-Content-Type-Options` header cannot be recognized. |    -5    |

## X-Frame-Options

See
[X-Frame-Options](/en-US/docs/Web/Security/Practical_implementation_guides/Clickjacking)
for guidance.

| Test result                         | Description                                                                  | Modifier |
| ----------------------------------- | ---------------------------------------------------------------------------- | :------: |
| x-frame-options-implemented-via-csp | `X-Frame-Options` (XFO) implemented via the CSP `frame-ancestors` directive. |    5     |
| x-frame-options-sameorigin-or-deny  | `X-Frame-Options` (XFO) header set to `SAMEORIGIN` or `DENY`.                |    0     |
| x-frame-options-allow-from-origin   | `X-Frame-Options` (XFO) header uses `ALLOW-FROM` uri directive.              |    0     |
| x-frame-options-not-implemented     | `X-Frame-Options` (XFO) header not implemented.                              |   -20    |
| x-frame-options-header-invalid      | `X-Frame-Options` (XFO) header cannot be recognized.                         |   -20    |

## Cross-Origin-Resource-Policy (CORP)

See
[CORP implementation](/en-US/docs/Web/Security/Practical_implementation_guides/CORP)
for guidance.

| Test result                        | Description                                                                                           | Modifier |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | :------: |
| corp-not-implemented               | Cross Origin Resource Policy (CORP) is not implemented (defaults to cross-origin).                    |    0     |
| corp-implemented-with-same-origin  | Cross Origin Resource Policy (CORP) implemented, prevents leaks into cross-origin contexts.           |    10    |
| corp-implemented-with-same-site    | Cross Origin Resource Policy (CORP) implemented, prevents leaks into cross-site contexts.             |    10    |
| corp-implemented-with-cross-origin | Cross Origin Resource Policy (CORP) implemented, but allows cross-origin resource sharing by default. |    0     |
| corp-header-invalid                | Cross Origin Resource Policy (CORP) cannot be recognized.                                             |    -5    |
