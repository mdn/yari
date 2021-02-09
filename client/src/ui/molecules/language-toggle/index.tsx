import { Translation } from "../../../document/types";

import "./index.scss";

export function LanguageToggle({
  locale,
  translations,
}: {
  locale: string;
  translations: Translation[];
}) {
  return (
    <ul className="language-toggle">
      <li>
        <a href="#select_language" className="icon language-icon">
          <span className="show-desktop">Change language</span>
        </a>
      </li>
      {locale.toLowerCase() !== "en-us" &&
        translations.map((translation, index) => {
          if (translation.locale.toLowerCase() === "en-us") {
            return (
              <li className="en-switch" key={index}>
                <a href={translation.url}>English</a>
              </li>
            );
          }
          return null;
        })}
    </ul>
  );
}
