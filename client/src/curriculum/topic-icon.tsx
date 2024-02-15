import { ReactComponent as ScriptingSVG } from "../../public/assets/curriculum/cur-topic-scripting.svg";
import { ReactComponent as ToolingSVG } from "../../public/assets/curriculum/cur-topic-tooling.svg";
import { ReactComponent as StandardsSVG } from "../../public/assets/curriculum/cur-topic-standards.svg";
import { ReactComponent as StylingSVG } from "../../public/assets/curriculum/cur-topic-styling.svg";
import { ReactComponent as PracticesSVG } from "../../public/assets/curriculum/cur-topic-practices.svg";

import "./topic-icon.scss";

// Using this import fails the build...
//import { Topic } from "../../../libs/types/curriculum";
enum Topic {
  WebStandards = "Web Standards & Semantics",
  Styling = "Styling",
  Scripting = "Scripting",
  BestPractices = "Best Practices",
  Tooling = "Tooling",
  None = "",
}

export function TopicIcon({ topic }: { topic: Topic }) {
  switch (topic) {
    case Topic.WebStandards:
      return (
        <StandardsSVG role="none" className="topic-icon topic-standards" />
      );
    case Topic.Styling:
      return <StylingSVG role="none" className="topic-icon topic-styling" />;
    case Topic.Scripting:
      return (
        <ScriptingSVG role="none" className="topic-icon topic-scripting" />
      );
    case Topic.Tooling:
      return <ToolingSVG role="none" className="topic-icon topic-tooling" />;
    case Topic.BestPractices:
      return (
        <PracticesSVG role="none" className="topic-icon topic-practices" />
      );
    default:
      return <></>;
  }
}
