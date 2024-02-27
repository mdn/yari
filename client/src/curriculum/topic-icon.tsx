import { ReactComponent as ScriptingSVG } from "../../public/assets/curriculum/curriculum-topic-scripting.svg";
import { ReactComponent as ToolingSVG } from "../../public/assets/curriculum/curriculum-topic-tooling.svg";
import { ReactComponent as StandardsSVG } from "../../public/assets/curriculum/curriculum-topic-standards.svg";
import { ReactComponent as StylingSVG } from "../../public/assets/curriculum/curriculum-topic-styling.svg";
import { ReactComponent as PracticesSVG } from "../../public/assets/curriculum/curriculum-topic-practices.svg";

import "./topic-icon.scss";
import { Topic, topic2css } from "./utils";

export function TopicIcon({ topic }: { topic: Topic }) {
  const className = `topic-icon ${topic2css(topic)}`;
  switch (topic) {
    case Topic.WebStandards:
      return <StandardsSVG role="none" className={className} />;
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
