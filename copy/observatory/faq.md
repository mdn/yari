---
title: FAQ
---

# Frequently asked questions

## Should I implement all recommendations?

Yes, you should do it if possible. There is no way to programmatically determine
the risk level of any given site. However, while your site may not be high-risk,
it is still worth learning about the defensive security standards highlighted by
Observatory, and implementing them wherever you can.

## If I get an A+ grade, does that mean my site is secure?

We'd love to say that any site that gets an A+ Observatory grade is perfectly
secure, but there are a lot of security considerations that we can't test.
Observatory tests for preventative measures against
[Cross-site scripting (XSS)](/en-US/docs/Glossary/Cross-site_scripting) attacks,
[manipulator-in-the-middle (MiTM)](/en-US/docs/Glossary/MitM) attacks,
cross-domain information leakage, insecure
[cookies](/en-US/docs/Web/HTTP/Cookies),
[Content Delivery Network](/en-US/docs/Glossary/CDN) (CDN) compromises, and
improperly issued certificates.

However, it does not test for outdated software versions,
[SQL injection](/en-US/docs/Glossary/SQL_Injection) vulnerabilities, vulnerable
content management system plugins, improper creation or storage of passwords,
and more. These are just as important as the issues Observatory _does_ test for,
and site operators should not be neglectful of them simply because they score
well on Observatory.

## Can I scan non-websites, such as API endpoints?

The HTTP Observatory is designed for scanning websites, not API endpoints. It
can be used for API endpoints, and the security headers expected by Observatory
shouldn't cause any negative impact for APIs that return exclusively data, such
as JSON or XML. However, the results may not accurately reflect the security
posture of the API. API endpoints generally should only be accessible over
HTTPS. The recommended configuration for API endpoints is:

```http
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000
X-Content-Type-Options: nosniff
```

## Can other people see my test results?

Anyone can choose to scan any domain, and the scan history for each domain is
public. However, HTTP Observatory does not store user data related to each scan.
In the old version of HTTP Observatory, users could choose to set their scan to
"public" or keep it private (the default), and there was a "recent scans" list
where domain names were listed. "Recent scans" was the main feature that users
would potentially wish to opt-out from, but it is no longer supported, hence
there is now no reason to provide the "public" flag.

## Why did Mozilla move Observatory to MDN?

Observatory is a well-respected tool in the web and security communities, but it
hasn't seen a major update for quite some time. Mozilla decided that the tool
deserved to evolve and find new audience members to benefit from the security
knowledge contained within. MDN is a popular site with a large audience of web
developers who could benefit from this knowledge, so it is a perfect new home.
In addition, the MDN team was very excited to update the tool's UI,
functionality, and documentation, bringing it up-to-date and giving it some
polish.

## When did the move occur?

HTTP Observatory was launched on MDN on June 27, 2024, with the existing Mozilla
Observatory site redirecting to it. Other tools like TLS Observatory, SSH
Observatory, and Third-party tests have been deprecated, and will be sunset in
September 2024.

> **Note:** Historic scan data has been preserved, and is included in the
> provided scan history for each domain.

## What has changed after the migration?

The MDN team has:

- Updated the UI to improve the site's look and make it easier to use.
- Updated the
  [accompanying documentation](/en-US/docs/Web/Security/Practical_implementation_guides#content_security_fundamentals)
  to bring it up to date and improve legibility.
- Changed the "rescan" checkbox and its underlying mechanics:
  - There is no longer a rescan parameter.
  - A site can only be scanned and a new result returned every 60 seconds.
- Updated the
  [tests](/en-US/observatory/docs/scoring_methodology#tests-and-score-modifiers)
  to bring them up-to-date with latest security best practices:
  - Removed the out-of-date `X-XSS-Protection` test.
  - Removed the out-of-date Flash and Silverlight (`clientaccesspolicy.xml` and
    `crossdomain.xml`) embedding tests.
  - Added a
    [`Cross-Origin-Resource-Policy`](/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy)
    (CORP) test.
  - Updated the
    [`Referrer-Policy`](/en-US/docs/Web/HTTP/Headers/Referrer-Policy) test to
    update the score modifier for `referrer-policy-unsafe` and remove the
    `referrer-policy-no-referrer-when-downgrade` result.

## Has the HTTP Observatory API been updated to use the new tests?

Not yet. The API will continue using the old test infrastructure for a while,
therefore you will see some small differences between test scores returned by
the API and the website. The API will be updated to use the new tests in a
near-future iteration.

## (Redirection) What is the [HTTP redirection test](/en-US/docs/Web/Security/Practical_implementation_guides/TLS#http_redirection) assessing?

This test is checking whether your web server is making its initial redirection
from HTTP to HTTPS, on the same hostname, before doing any further redirections.
This allows the HTTP
[`Strict-Transport-Security`](/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
(HSTS) header to be applied properly.

For example, this redirection order is correct:

`http://example.com` → `https://example.com` → `https://www.example.com`

An incorrect (and penalized) redirection looks like this:

`http://example.com` → `https://www.example.com`

## (X-Frame-Options) What if I want to allow my site to be framed?

As long as you are explicit about your preference by using the
[`Content-Security-Policy`](/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
[`frame-ancestors`](/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
directive, you will pass the
[`X-Frame-Options`](/en-US/docs/Web/HTTP/Headers/X-Frame-Options) test. For
example, to allow your site to be framed by any HTTPS site:

```http
Content-Security-Policy: frame-ancestors https:
```
