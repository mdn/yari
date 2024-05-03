import { DEFAULT_LOCALE } from "../../../libs/constants";
import { useLocale } from "../hooks";
import { BASELINE } from "../telemetry/constants";
import { useGleanClick } from "../telemetry/glean-context";
import { Icon } from "../ui/atoms/icon";
import { useLocation } from "react-router";

import "./baseline-indicator.scss";

import type {
  SupportStatus,
  browserIdentifier,
} from "../../../libs/types/web-features";

interface BrowserGroup {
  name: string;
  ids: browserIdentifier[];
}

const ENGINES: {
  name: string;
  browsers: BrowserGroup[];
}[] = [
  {
    name: "Blink",
    browsers: [
      { name: "Chrome", ids: ["chrome", "chrome_android"] },
      { name: "Edge", ids: ["edge"] },
    ],
  },
  {
    name: "Gecko",
    browsers: [{ name: "Firefox", ids: ["firefox", "firefox_android"] }],
  },
  {
    name: "WebKit",
    browsers: [{ name: "Safari", ids: ["safari", "safari_ios"] }],
  },
];

const LOCALIZED_BCD_IDS = {
  "en-US": "browser_compatibility",
  es: "compatibilidad_con_navegadores",
  fr: "compatibilité_des_navigateurs",
  ja: "ブラウザーの互換性",
  ko: "브라우저_호환성",
  "pt-BR": "compatibilidade_com_navegadores",
  ru: "совместимость_с_браузерами",
  "zh-CN": "浏览器兼容性",
  "zh-TW": "瀏覽器相容性",
};

const SURVEY_URL =
  "https://survey.alchemer.com/s3/7634825/MDN-baseline-feedback";

export function BaselineIndicator({ status }: { status: SupportStatus }) {
  const gleanClick = useGleanClick();
  const locale = useLocale();
  const { pathname } = useLocation();

  const bcdLink = `#${
    LOCALIZED_BCD_IDS[locale] || LOCALIZED_BCD_IDS[DEFAULT_LOCALE]
  }`;

  const low_date = status.baseline_low_date
    ? new Date(status.baseline_low_date)
    : undefined;
  const level = status.baseline
    ? status.baseline
    : status.baseline === false
      ? "not"
      : undefined;

  const feedbackLink = `${SURVEY_URL}?page=${encodeURIComponent(
    pathname
  )}&level=${level}`;

  const supported = (browser: BrowserGroup) => {
    return browser.ids
      .map((id) => status.support?.[id])
      .every((version) => Boolean(version));
  };

  const engineTitle = (browsers: BrowserGroup[]) =>
    browsers
      .map((browser, index, array) => {
        const previous = index > 0 ? supported(array[index - 1]) : undefined;
        const current = supported(browser);
        const name = browser.name;
        return typeof previous === "undefined"
          ? current
            ? `Supported in ${name}`
            : `Not widely supported in ${name}`
          : current === previous
            ? ` and ${name}`
            : current
              ? `, and supported in ${name}`
              : `, and not widely supported in ${name}`;
      })
      .join("");

  return level ? (
    <details
      className={`baseline-indicator ${level}`}
      onToggle={(e) => e.currentTarget.open && gleanClick(BASELINE.TOGGLE_OPEN)}
    >
      <summary>
        <span
          className="indicator"
          role="img"
          aria-label={level !== "not" ? "Baseline Check" : "Baseline Cross"}
        />
        <h2>
          {level !== "not" ? (
            <>
              Baseline{" "}
              <span className="not-bold">
                {level === "high"
                  ? "Widely available"
                  : low_date?.getFullYear()}
              </span>
            </>
          ) : (
            <span className="not-bold">Limited availability</span>
          )}
        </h2>
        {level === "low" && <div className="pill">Newly available</div>}
        <div className="browsers">
          {ENGINES.map(({ name, browsers }) => (
            <span key={name} className="engine" title={engineTitle(browsers)}>
              {browsers.map((browser) => (
                <span
                  key={browser.ids[0]}
                  className={`browser ${browser.ids[0]} ${
                    supported(browser) ? "supported" : ""
                  }`}
                  role="img"
                  aria-label={`${browser.name} ${
                    supported(browser) ? "check" : "cross"
                  }`}
                />
              ))}
            </span>
          ))}
        </div>
        <Icon name="chevron" />
      </summary>
      <div className="extra">
        {level === "high" && low_date ? (
          <p>
            This feature is well established and works across many devices and
            browser versions. It’s been available across browsers since{" "}
            {low_date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
            .
          </p>
        ) : level === "low" && low_date ? (
          <p>
            Since{" "}
            {low_date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
            , this feature works across the latest devices and browser versions.
            This feature might not work in older devices or browsers.
          </p>
        ) : (
          <p>
            This feature is not Baseline because it does not work in some of the
            most widely-used browsers.
          </p>
        )}
        <ul>
          <li>
            <a
              href="/en-US/blog/baseline-evolution-on-mdn/"
              data-glean={BASELINE.LINK_LEARN_MORE}
              target="_blank"
              className="learn-more"
            >
              Learn more
            </a>
          </li>
          <li>
            <a href={bcdLink} data-glean={BASELINE.LINK_BCD_TABLE}>
              See full compatibility
            </a>
          </li>
          <li>
            <a
              href={feedbackLink}
              data-glean={BASELINE.LINK_FEEDBACK}
              className="feedback-link"
              target="_blank"
              rel="noreferrer"
            >
              Report feedback
            </a>
          </li>
        </ul>
      </div>
    </details>
  ) : null;
}
