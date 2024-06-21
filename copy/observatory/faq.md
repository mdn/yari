---
title: FAQ
---

# Frequently asked questions

## General

### Do I need to implement CSP, SRI, etc. on my personal blog?

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

### If my scan is marked “hidden”, does that mean nobody can see it?

Hidden scans are simply marked as being hidden from home page lists such as the
“Hall of Fame.” Users and organizations that need truly confidential results
should download the Observatory scanner and run a private installation.

## Observatory’s migration to MDN

### Why did Mozilla move Observatory to MDN?

Observatory is a well-respected tool in the web and security communities, but it
hasn’t seen a major update for quite some time. Mozilla decided that the tool
deserved to evolve and find new audience members to benefit from the security
knowledge contained within. MDN is a popular site with a large audience of web
developers who could benefit from this knowledge, so it seemed like a perfect
new home. In addition, the MDN team was very excited to update the tool’s UI,
functionality, and documentation, bringing it up-to-date and giving ti some
polish.

### When did the migration occur?

Observatory migrated to MDN in June 2024.

### What has changed after the migration?

The Mozilla team has:

Improved the UI to improve the site’s look and make it easier to use. Updated
the accompanying documentation to bring it up to date and improve legibility.
Removed some out-of-date tests, such as the HTTP Public Key Pinning test. xx

## Test specifics

### (HTTP Public Key Pinning) I passed this test, but I didn't implement HPKP!

HTTP Public Key Pinning is targeted specifically towards large and/or sensitive
websites and implementing it is considered optional. The only way to fail this
test is to return an invalid header, such as one that doesn't contain a
sufficient number of pins. Sites that do HPKP will get a small bonus on their
final grade.

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

## Third-party integration

### When I initiated a rescan, the third-party results didn't update. What happened?

To reduce load on our third-party providers, the Mozilla Observatory always
returns cached results from them. However, if you follow a link to your results
for a third party, most of them will offer the option to scan again. Their
updated results will then be reflected in the Observatory.

### What is ssllabs.com?

ssllabs.com is a TLS/SSL scanner by [Qualys](https://www.qualys.com/) that
analyzes your combination of cipher suites, handshake methods, supported
protocols, and resistance against a variety of TLS attacks. It outputs a grade
that reflects how secure those choices are.

### What is ImmuniWeb?

https://immuniweb.com/ssl is a TLS/SSL scanner by
[ImmuniWeb](https://www.immuniweb.com/) that analyzes your combination of cipher
suites, handshake methods, supported protocols, and resistance against a variety
of TLS attacks. It outputs a grade that reflects how secure those choices are.
For sites that need it, it also tests your configuration against requirements
set by HIPAA, NIST, and PCI-DSS.

### What is tls.imirhil.fr?

https://cryptcheck.fr/ is a TLS/SSL scanner by [Aeris](https://imirhil.fr/). It
is strongly forward-focused and tests for configurations that are not
necessarily appropriate for general-purpose websites.

### What is securityheaders.com?

https://securityheaders.com/ is an HTTP header analyzer run by @Scott_Helme that
performs scans similar to those done by Observatory, by testing HTTP headers.
The two sites carry out similar tests, however, when it comes to security a
second opinion is often useful.

### What is hstspreload.org?

hstspreload.org is a site run by Nick Harper that manages the HTTP
`Strict-Transport-Security` (HSTS) preload list. The preload list is a directory
of sites that have opted into having browsers connect to their website only over
HTTPS before the `Strict-Transport-Security` header is read. This helps solve
the trust-on-first-use issue, where a manipulator-in-the-middle could prevent a
user from ever upgrading to HTTPS and seeing the HSTS header.

### What is globalcyberalliance.org?

The [Global Cyber Alliance](https://globalcyberalliance.org/) (GCA) is an
international, cross-sector effort dedicated to reducing cyber risk and
improving our connected world. They unite global communities, implement concrete
solutions, and measure the effects.
