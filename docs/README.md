# Yari documentation

The documentation in this directory describes architecture, usage, deployment,
and troubleshooting Yari including details about KumaScript functionality.

## About Yari

Yari is the code that renders MDN Web Docs. It takes a
[JAMStack](https://jamstack.org/) approach, which reads MDN content stored as
flat source files in a GitHub repo (including front matter and macros), renders
the result as static HTML files, and serves those as quickly and efficiently as
possible.

The core MDN platform consists of two GitHub repos:

- [The MDN content repo](https://github.com/mdn/content) — this is where the MDN
  content is stored, along with information such as contributor history and
  redirects. Visit this repo if you want to contribute to the MDN content.
- [The Yari project](https://github.com/mdn/yari) — this is the platform code
  that renders and displays the MDN content, and deals with associated services
  such as user accounts. Visit this repo if you want to contribute to the MDN
  platform.

### KumaScript

KumaScript is a legacy template/macro system that automates certain aspects of
MDN Web Docs content. For more information about KumaScript, see the
[kumascript directory](./kumascript/) which describes macros, troubleshooting
errors, usage, and more.

## See also

- [MDN Web Docs evolves! Lowdown on the upcoming new platform](https://hacks.mozilla.org/2020/10/mdn-web-docs-evolves-lowdown-on-the-upcoming-new-platform/)
  — explanation of the need for a platform change, and the new architecture.
- As needed, take a deep dive into the
  [Welcome Yari: MDN Web Docs has a new platform](https://hacks.mozilla.org/2020/12/welcome-yari-mdn-web-docs-has-a-new-platform/)
  — formal announcement of the new platform launch.
