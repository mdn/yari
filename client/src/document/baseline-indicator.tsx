import { WebFeatureStatus } from "../../../libs/types/document";
import { useLocale } from "../hooks";
import { BASELINE } from "../telemetry/constants";
import { useGleanClick } from "../telemetry/glean-context";
import { Icon } from "../ui/atoms/icon";
import "./baseline-indicator.scss";

type BaselineLevel = undefined | "no" | "low" | "high";

const BASELINE_HIGH_CUTOFF = new Date();
BASELINE_HIGH_CUTOFF.setMonth(BASELINE_HIGH_CUTOFF.getMonth() - 30);

const ENGINES = [
  { name: "Blink", browsers: ["Chrome", "Edge"] },
  { name: "Gecko", browsers: ["Firefox"] },
  { name: "WebKit", browsers: ["Safari"] },
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

export function BaselineIndicator({ status }: { status: WebFeatureStatus }) {
  const gleanClick = useGleanClick();
  const locale = useLocale();

  const bcdLink = `#${LOCALIZED_BCD_IDS[locale] || LOCALIZED_BCD_IDS["en-US"]}`;

  const since = status.since ? new Date(status.since) : undefined;
  const level: BaselineLevel =
    typeof status.is_baseline !== "undefined"
      ? status.is_baseline && since
        ? since < BASELINE_HIGH_CUTOFF
          ? "high"
          : "low"
        : "no"
      : undefined;

  const supported = (browser: string) => {
    const version: string | boolean | undefined =
      status.support?.[browser.toLowerCase()];
    return Boolean(
      status.is_baseline || typeof version === "string" || version
    );
  };

  const engineTitle = (browsers: string[]) =>
    browsers
      .map((browser, index, array) => {
        const previous = index > 0 ? supported(array[index - 1]) : undefined;
        const current = supported(browser);
        return typeof previous === "undefined"
          ? current
            ? `Supported in ${browser}`
            : `Not widely supported in ${browser}`
          : current === previous
          ? ` and ${browser}`
          : current
          ? `, and supported in ${browser}`
          : `, and not widely supported in ${browser}`;
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
          aria-label={level !== "no" ? "Baseline Check" : "Baseline Cross"}
        />
        <h2>
          {level !== "no" ? (
            <>
              Baseline{" "}
              <span className="not-bold">
                {level === "high" ? "Widely available" : since?.getFullYear()}
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
                  key={browser}
                  className={`browser ${browser.toLowerCase()} ${
                    supported(browser) ? "supported" : ""
                  }`}
                  role="img"
                  aria-label={`${browser} ${
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
        {level === "high" ? (
          <p>
            This feature is well established and works across many devices and
            browser versions. It’s been available across browsers since{" "}
            {since?.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
            .
          </p>
        ) : level === "low" ? (
          <p>
            Since{" "}
            {since?.toLocaleDateString("en-US", {
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
              href="/en-US/blog/baseline-unified-view-stable-web-features/"
              data-glean={BASELINE.LINK_LEARN_MORE}
              target="_blank"
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
              href="https://example.com"
              data-glean={BASELINE.LINK_FEEDBACK}
              className="feedback-link"
              target="_blank"
              rel="noreferrer"
            >
              <span className="visually-hidden">Feedback</span>
            </a>
          </li>
        </ul>
      </div>
    </details>
  ) : null;
}
