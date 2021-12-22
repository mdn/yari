import * as React from "react";
import { useLocale } from "../../../hooks";
import "./index.scss";

import { ReactComponent as MDNLogo } from "../../../assets/mdn-footer-logo.svg";
import { ReactComponent as MozLogo } from "../../../assets/moz-logo.svg";
const appDlApple = `${process.env.PUBLIC_URL || ""}/assets/app-dl-apple.svg`;
const appDlGoogle = `${process.env.PUBLIC_URL || ""}/assets/app-dl-google.svg`;
const appDlMs = `${process.env.PUBLIC_URL || ""}/assets/app-dl-ms.png`;

export function Footer() {
  const locale = useLocale();

  return (
    <footer id="nav-footer" className="page-footer">
      <div className="page-footer-grid">
        <div className="page-footer-logo-col">
          <a href="/" className="mdn-footer-logo">
            <MDNLogo />
          </a>
          <p>
            The Mozilla Developer Network's mission is simple: provide
            developers with the information they need to easily build projects
            on the open Web.
          </p>
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
                <span className="visually-hidden">MDN on Github</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-nav-col-1">
          <h2 className="footer-nav-heading">MDN</h2>
          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <a href={`/${locale}/docs/MDN/About`}>About</a>
            </li>
            <li className="footer-nav-item">
              <a href={`/${locale}/#TODO`}>Careers</a>
            </li>
            <li className="footer-nav-item">
              <a
                href="https://shop.spreadshirt.com/mdn-store/"
                target="_blank"
                rel="noopener noreferrer"
              >
                MDN Store
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-nav-col-2">
          <h2 className="footer-nav-heading">Support</h2>
          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/${locale}/#TODO`}>
                Product Help
              </a>
            </li>
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/${locale}/#TODO`}>
                Report a Documentation Issue
              </a>
            </li>
            <li className="footer-nav-item">
              <a
                className="footer-nav-link"
                href={`/${locale}/docs/MDN/Feedback`}
              >
                Report a Site Issue
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-nav-col-3">
          <h2 className="footer-nav-heading">Our Communities</h2>
          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/${locale}/#TODO`}>
                Contribute to MDN
              </a>
            </li>
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/${locale}/#TODO`}>
                MDN Forums
              </a>
            </li>
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/${locale}/#TODO`}>
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
              <a className="footer-nav-link" href={`/${locale}/#TODO`}>
                Learn Web Development
              </a>
            </li>
            <li className="footer-nav-item">
              <a className="footer-nav-link" href={`/${locale}/#TODO`}>
                MDN Plus
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-app-col">
          <h2 className="footer-nav-heading">Get the app</h2>
          <ul className="page-footer-app-list">
            <li className="page-footer-app-item">
              <a
                className="page-footer-app-dl is-apple"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={appDlApple}
                  alt="Download the App from the Apple Store"
                />
              </a>
            </li>
            <li className="page-footer-app-item">
              <a
                className="page-footer-app-dl is-google"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={appDlGoogle}
                  alt="Download the App from the Google Play Store"
                />
              </a>
            </li>
            <li className="page-footer-app-item">
              <a
                className="page-footer-app-dl is-ms"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={appDlMs} alt="Download the App from Microsoft" />
              </a>
            </li>
          </ul>
        </div>

        <div className="page-footer-moz">
          <a href="#" className="footer-moz-logo-link">
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
                href="#"
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
            <a href="/docs/MDN/About#Copyrights_and_licenses">
              a Creative Commons license
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
