import React from "react";
import { Link } from "react-router-dom";

import "./languages.css";

export function DocumentTranslations({ translations }) {
  const [showChoices, setShowChoices] = React.useState(false);
  function toggleOnHandler(event) {
    event.preventDefault();
    setShowChoices(true);
  }
  function toggleOffHandler(event) {
    event.preventDefault();
    setShowChoices(false);
  }

  // XXX Needs to be like this... (from Kuma's DOM)
  // <div className="dropdown-container language-menu">
  //     <button
  //       id="header-language-menu"
  //       type="button"
  //       className="dropdown-menu-label"
  //       aria-haspopup="true"
  //       aria-owns="language-menu"
  //       aria-label="Current language is English. Choose your preferred language."
  //     >
  //       English
  //       <span className="dropdown-arrow-down" aria-hidden="true">
  //         ▼
  //       </span>
  //     </button>

  //     <ul
  //       id="language-menu"
  //       className="dropdown-menu-items right "
  //       aria-expanded="false"
  //       role="menu"
  //     >
  //       <li>
  //         <a
  //           href="http://wiki.localhost.org:8000/en-US/docs/Web/HTML/Element/video$locales"
  //           rel="nofollow"
  //           id="translations-add"
  //         >
  //           Add a translation
  //         </a>
  //       </li>
  //     </ul>
  //   </div>

  return (
    <div className="document-languages">
      {showChoices ? (
        <div className="choices">
          <a href="." onClick={toggleOffHandler}>
            <b>Close ⨂</b>
          </a>
          <ShowTranslations translations={translations} />
        </div>
      ) : (
        <a href="." onClick={toggleOnHandler}>
          Change language
        </a>
      )}
    </div>
  );
}

function ShowTranslations({ translations }) {
  return (
    <div className="translations">
      <ul>
        {translations.map((translation) => {
          const { slug, locale } = translation;
          const uri = `/${locale}/docs/${slug}`;
          return (
            <li key={uri}>
              <Link to={uri}>{locale}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
