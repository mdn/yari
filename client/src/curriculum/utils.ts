// Using this import fails the build...
//import { Topic } from "../../../libs/types/curriculum";
export enum Topic {
  WebStandards = "Web Standards & Semantics",
  Styling = "Styling",
  Scripting = "Scripting",
  BestPractices = "Best Practices",
  Tooling = "Tooling",
  None = "",
}
export function topic2css(topic?: Topic) {
  switch (topic) {
    case Topic.WebStandards:
      return "standards";
    case Topic.Styling:
      return "styling";
    case Topic.Scripting:
      return "scripting";
    case Topic.Tooling:
      return "tooling";
    case Topic.BestPractices:
      return "practices";
    default:
      return "none";
  }
}
