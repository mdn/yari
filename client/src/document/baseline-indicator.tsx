import { DEFAULT_LOCALE } from "../../../libs/constants";
import { WebFeatureStatus } from "../../../libs/types/document";
import { useLocale } from "../hooks";
import { BASELINE } from "../telemetry/constants";
import { useGleanClick } from "../telemetry/glean-context";
import { Icon } from "../ui/atoms/icon";
import "./baseline-indicator.scss";

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

  const bcdLink = `#${
    LOCALIZED_BCD_IDS[locale] || LOCALIZED_BCD_IDS[DEFAULT_LOCALE]
  }`;

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

  return typeof status.is_baseline !== "undefined" ? (
    <details
      className={`baseline-indicator ${status.is_baseline ? "supported" : ""}`}
      onToggle={(e) => e.currentTarget.open && gleanClick(BASELINE.TOGGLE_OPEN)}
    >
      <summary>
        <span
          className="indicator"
          role="img"
          aria-label={status.is_baseline ? "Baseline Check" : "Baseline Cross"}
        />
        <h2>
          Baseline:{" "}
          <span className="not-bold">
            {status.is_baseline ? "Widely supported" : "Not widely supported"}
          </span>
        </h2>
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
        <p>
          Baseline is determined by this web feature being supported on the
          current and the previous major versions of major browsers.
        </p>
        <ul>
          <li>
            <a
              href="/en-US/blog/baseline-unified-view-stable-web-features/"
              data-glean={BASELINE.LINK_LEARN_MORE}
            >
              Learn more
            </a>
          </li>
          <li>
            <a href={bcdLink} data-glean={BASELINE.LINK_BCD_TABLE}>
              See full compatibility
            </a>
          </li>
        </ul>
      </div>
    </details>
  ) : null;
}
