---
title: FAQ
---

# Frequently asked questions

## General

### Do I have to implement all recommendations?

There is no way to programmatically determine the risk level of any given site.
While your site may not be high-risk, it is still worth learning about the
defensive security standards highlighted by Observatory, and implementing them
wherever you can.

### If I get an A+ on the Observatory, does that mean my site is secure?

We'd love to say that any site that gets an A+ Observatory grade is perfectly
secure, but there are a lot of security considerations that we can’t test.
Observatory tests for preventative measures against
[Cross-site scripting (XSS)](/en-US/docs/Glossary/Cross-site_scripting) attacks,
[manipulator-in-the-middle (MiTM)](/en-US/docs/Glossary/MitM) attacks,
cross-domain information leakage, insecure
[cookies](/en-US/docs/Web/HTTP/Cookies),
[Content Delivery Network](/en-US/docs/Glossary/CDN) (CDN) compromises, and
improperly issued certificates. However, it does not test for outdated software
versions, [SQL injection](/en-US/docs/Glossary/SQL_Injection) vulnerabilities,
vulnerable content management system plugins, improper creation or storage of
passwords, and more. These are just as important as the considerations
Observatory tests, and site operators should not be neglectful of them simply
because they score well on Observatory.

### Is the Mozilla Observatory useful for scanning non-websites, such as API endpoints?

The HTTP Observatory is designed for scanning websites, not API endpoints. It
can be used for API endpoints, and the security headers expected by Observatory
shouldn't cause any negative impact for APIs that return exclusively data, such
as JSON or XML. However, the results may not accurately reflect the security
posture of the API. The recommended configuration for API endpoints is:

```http
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000
X-Content-Type-Options: nosniff
```

### Can other people see my test results?

Observatory scans are no longer public. In the previous version of Observatory,
users had the option of making their scan results public, but this is no longer
the case. On the other hand, anyone can choose to scan any domain, so no public
website’s observatory test scores can be kept secret.

## Observatory’s migration to MDN

### Why did Mozilla move Observatory to MDN?

Observatory is a well-respected tool in the web and security communities, but it
hasn’t seen a major update for quite some time. Mozilla decided that the tool
deserved to evolve and find new audience members to benefit from the security
knowledge contained within. MDN is a popular site with a large audience of web
developers who could benefit from this knowledge, so it seemed like a perfect
new home. In addition, the MDN team was very excited to update the tool’s UI,
functionality, and documentation, bringing it up-to-date and giving it some
polish.

### When did the migration occur?

HTTP Observatory was launched on MDN in June 2024, and the existing Mozilla
Observatory will be sunset in the coming months.

### What has changed after the migration?

The MDN team has:

Improved the UI to improve the site’s look and make it easier to use. Updated
the accompanying documentation to bring it up to date and improve legibility.
Removed some out-of-date tests, such as the HTTP Public Key Pinning tests. xx

## Test specifics

### (Redirection) What is the [HTTP redirection test](/en-US/docs/Web/Security/Practical_implementation_guides/TLS#http_redirection) assessing?

This test is checking whether your web server is making its initial redirection
from HTTP to HTTPS, on the same hostname, before doing any further redirections.
This allows the HTTP
[`Strict-Transport-Security`](/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
(HSTS) header to be applied properly. For example, this redirection order is
correct: `http://example.com` → `https://example.com` →
`https://www.example.com`. An incorrect (and penalized) redirection looks like
this: `http://example.com` → `https://www.example.com`.

### (X-Frame-Options) What if I want to allow my site to be framed?

As long as you are explicit about your preference by using the
[`Content-Security-Policy`](/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
[`frame-ancestors`](/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
directive, you will pass the
[`X-Frame-Options`](/en-US/docs/Web/HTTP/Headers/X-Frame-Options) test. For
example, to allow your site to be framed by any HTTPS site:

```http
Content-Security-Policy: frame-ancestors https:
```
