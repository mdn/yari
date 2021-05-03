import * as React from "react";
import { useLocale } from "../../../hooks";
import { Logo } from "../../atoms/logo";
import "./index.scss";

export function Footer() {
  const locale = useLocale();

  return (
    <footer id="nav-footer" className="page-footer">
      <div className="content-container">
        <div className="page-footer-logo">
          <Logo mode="dark" />
        </div>
        <ul className="link-list-mdn">
          <li>
            <a href={`/${locale}/docs/Web`}>Web Technologies</a>
          </li>
          <li>
            <a href={`/${locale}/docs/Learn`}>Learn Web Development</a>
          </li>
          <li>
            <a href={`/${locale}/docs/MDN/About`}>About MDN</a>
          </li>
          <li>
            <a href={`/${locale}/docs/MDN/Feedback`}>Feedback</a>
          </li>
        </ul>

        <ul className="link-list-moz">
          <li>
            <a
              href="https://www.mozilla.org/about/"
              target="_blank"
              rel="noopener noreferrer"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="https://shop.spreadshirt.com/mdn-store/"
              target="_blank"
              rel="noopener noreferrer"
            >
              MDN Web Docs Store
            </a>
          </li>
          <li>
            <a
              href="https://www.mozilla.org/contact/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Us
            </a>
          </li>
          <li>
            <a
              href="https://www.mozilla.org/firefox/?utm_source=developer.mozilla.org&utm_campaign=footer&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firefox
            </a>
          </li>
        </ul>

        <div className="social social-mdn">
          <h4>MDN</h4>
          <ul>
            <li>
              <a
                className="social-icon twitter"
                href="https://twitter.com/mozdevnet"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="visually-hidden">MDN on Twitter</span>
              </a>
            </li>
            <li>
              <a
                className="social-icon github"
                href="https://github.com/mdn/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="visually-hidden">MDN on Github</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="social social-moz">
          <h4>Mozilla</h4>
          <ul>
            <li>
              <a
                className="social-icon github"
                href="https://twitter.com/mozilla"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="visually-hidden">Mozilla on Twitter</span>
              </a>
            </li>
            <li>
              <a
                className="social-icon instagram"
                href="https://www.instagram.com/mozillagram/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="visually-hidden">Mozilla on Instagram</span>
              </a>
            </li>
          </ul>
        </div>

        <p id="license" className="footer-license">
          &copy; 2005-{new Date().getFullYear()} Mozilla and individual
          contributors. Content is available under{" "}
          <a href="/docs/MDN/About#Copyrights_and_licenses">these licenses</a>.
        </p>

        <ul className="footer-legal">
          <li>
            <a
              href="https://www.mozilla.org/about/legal/terms/mozilla"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms
            </a>
          </li>
          <li>
            <a
              href="https://www.mozilla.org/privacy/websites/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
          </li>
          <li>
            <a
              href="https://www.mozilla.org/privacy/websites/#cookies"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cookies
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
