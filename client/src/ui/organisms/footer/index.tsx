import { useLocale } from "../../../hooks";
import "./index.scss";
import { useLocation } from "react-router-dom";

import { ReactComponent as MDNLogo } from "../../../assets/mdn-footer-logo.svg";
import { ReactComponent as MozLogo } from "../../../assets/moz-logo.svg";
import { PLUS_IS_ENABLED } from "../../../env";
const DARK_NAV_ROUTES = [/\/plus\/?$/i];

export function Footer() {
  const locale = useLocale();
  const location = useLocation();
  const route = location.pathname.substring(location.pathname.indexOf("/", 1));
  const dark = DARK_NAV_ROUTES.some((r) => route.match(r));

  return (
    <footer id="nav-footer" className={`page-footer${dark ? " dark" : ""}`}>
      <div className="page-footer-grid">
        <div className="page-footer-logo-col">
          <a href="/" className="mdn-footer-logo" aria-label="MDN homepage">
            <MDNLogo />
          </a>
          <p>Your blueprint for a better internet.</p>
          <ul className="social-icons">
            <li>
              <a
                className="icon icon-twitter"
                href="https://twitter.com/mozdevnet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="visually-hidden">MDN on Twitter</span>
              </a>
            </li>
            <li>
              <a
                className="icon icon-github-mark-small"
                href="https://github.com/mdn/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="visually-hidden">MDN on GitHub</span>
              </a>
            </li>
            <li>
              <a
                className="icon icon-feed"
                href="/en-US/blog/rss.xml"
                target="_blank"
              >
                <span className="visually-hidden">MDN Blog RSS Feed</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-nav-col-1">
          <h2 className="footer-nav-heading">MDN</h2>
          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <a href={`/en-US/about`}>About</a>
            </li>
            <li className="footer-nav-item">
              <a href={`/en-US/blog/`}>Blog</a>
            </li>
            <li className="footer-nav-item">
              <a
                href="https://www.mozilla.org/en-US/careers/listings/?team=Marketing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Careers
              </a>
            </li>
            <li className="footer-nav-item">
              <a href={`/en-US/advertising`}>Advertise with us</a>
            </li>
          </ul>
        </div>

        <div className="page-footer-nav-col-2">
          <h2 className="footer-nav-heading">Support</h2>
          <ul className="footer-nav-list">
            {PLUS_IS_ENABLED && (
              <li className="footer-nav-item">
                <a
                  className="footer-nav-link"
                  href="https://support.mozilla.org/products/mdn-plus"
                >
                  Product help
                </a>
              </li>
            )}
            <li className="footer-nav-item">
              <a
                className="footer-nav-link"
                href={`/${locale}/docs/MDN/Community/Issues`}
              >
                Report an issue
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-nav-col-3">
          <h2 className="footer-nav-heading">Our communities</h2>
          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/en-US/community`}>
                MDN Community
              </a>
            </li>
            <li className="footer-nav-item">
              <a
                className="footer-nav-link"
                href="https://discourse.mozilla.org/c/mdn/236"
                target="_blank"
                rel="noopener noreferrer"
              >
                MDN Forum
              </a>
            </li>
            <li className="footer-nav-item">
              <a
                className="footer-nav-link"
                href="https://discord.gg/aZqEtMrbr7"
                target="_blank"
                rel="noopener noreferrer"
              >
                MDN Chat
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-nav-col-4">
          <h2 className="footer-nav-heading">Developers</h2>
          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/${locale}/docs/Web`}>
                Web Technologies
              </a>
            </li>
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/${locale}/docs/Learn`}>
                Learn Web Development
              </a>
            </li>
            {PLUS_IS_ENABLED && (
              <li className="footer-nav-item">
                <a className="footer-nav-link" href={`/${locale}/plus`}>
                  MDN Plus
                </a>
              </li>
            )}
            <li className="footer-nav-item">
              <a
                href="https://hacks.mozilla.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hacks Blog
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-moz">
          <a
            href="https://www.mozilla.org/"
            className="footer-moz-logo-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MozLogo />
          </a>
          <ul className="footer-moz-list">
            <li className="footer-moz-item">
              <a
                href="https://www.mozilla.org/privacy/websites/"
                className="footer-moz-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Website Privacy Notice
              </a>
            </li>
            <li className="footer-moz-item">
              <a
                href="https://www.mozilla.org/privacy/websites/#cookies"
                className="footer-moz-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cookies
              </a>
            </li>
            <li className="footer-moz-item">
              <a
                href="https://www.mozilla.org/about/legal/terms/mozilla"
                className="footer-moz-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Legal
              </a>
            </li>
            <li className="footer-moz-item">
              <a
                href="https://www.mozilla.org/about/governance/policies/participation/"
                className="footer-moz-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Community Participation Guidelines
              </a>
            </li>
          </ul>
        </div>
        <div className="page-footer-legal">
          <p id="license" className="page-footer-legal-text">
            Visit{" "}
            <a
              href="https://www.mozilla.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mozilla Corporation’s
            </a>{" "}
            not-for-profit parent, the{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://foundation.mozilla.org/"
            >
              Mozilla Foundation
            </a>
            .
            <br />
            Portions of this content are ©1998–{new Date().getFullYear()} by
            individual mozilla.org contributors. Content available under{" "}
            <a
              href={`/${locale}/docs/MDN/Writing_guidelines/Attrib_copyright_license`}
            >
              a Creative Commons license
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
