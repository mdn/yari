import React from "react";
import { withA11y } from "@storybook/addon-a11y";
import { button, withKnobs } from "@storybook/addon-knobs";

import { localize } from "../utils/l10n.js";
import MainMenu from "./main-menu.jsx";

export default {
  title: "Molecules|Main Menu",
  decorators: [withA11y, withKnobs]
};

const deStringCatalog = {
  "...more docs": "…weitere Dokumente",
  Accessibility: "Barrierefreiheit",
  "APIs / DOM": "APIs / DOM",
  "Browser Extensions": "Browser-Erweiterungen",
  CSS: "CSS",
  "Developer Guides": "Entwickler-Leitfäden",
  Feedback: "Feedback",
  "Game development": "Spieleentwicklung",
  "Get Firefox help": "Holen Sie sich Hilfe zu Firefox",
  "Get web development help": "Holen Sie sich Hilfe zu Web-Entwicklung",
  Graphics: "Grafik",
  HTML: "HTML",
  HTTP: "HTTP",
  JavaScript: "JavaScript",
  "Join the MDN community": "Werden Sie Teil der MDN-Gemeinschaft",
  "Learn Web Development": "Lernen Sie Web-Entwicklung",
  MathML: "MathML",
  References: "Nachschlagewerke",
  "References & Guides": "Referenzen & Leitfäden",
  "Report a content problem": "Melden Sie ein Inhaltsproblem",
  "Report an issue": "Ein Problem melden",
  "Send Feedback": "Feedback senden",
  Technologies: "Technologien",
  "Technologies Overview": "Technologieübersicht",
  Tutorials: "Anleitungen"
};
const frStringCatalog = {
  "...more docs": "… plus de documentation",
  Accessibility: "Accessibilité",
  CSS: "CSS",
  "Developer Guides": "Guides pour développeurs",
  Feedback: "Votre avis",
  "Game development": "Développement de jeux",
  "Get Firefox help": "Demander de l'aide pour Firefox",
  "Get web development help": "Demander de l'aide pour le développement web",
  Graphics: "Graphismes",
  HTML: "HTML",
  HTTP: "HTTP",
  JavaScript: "JavaScript",
  "Join the MDN community": "Rejoignez la communauté MDN",
  "Learn Web Development": "Apprendre le développement web",
  MathML: "MathML",
  References: "Références",
  "References & Guides": "Guides et références",
  "Report a content problem": "Signaler un problème de contenu",
  "Report an issue": "Signaler un problème",
  "Send Feedback": "Donner mon avis",
  Technologies: "Technologies",
  "Technologies Overview": "Aperçu des technologies",
  Tutorials: "Tutoriels"
};

let locale = "en-US";

button("English", () => {
  localize("en-US", null);
  locale = "en-US";
});

button("German", () => {
  localize("de", deStringCatalog);
  locale = "de";
});

button("French", () => {
  localize("fr", frStringCatalog);
  locale = "fr";
});

export const mainMenu = () => <MainMenu locale={locale} />;
