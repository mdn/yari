import { NotecardType } from "../../../types/notecards";

export default function NoteCard({
  children,
  type = "info",
  extraClasses,
}: {
  children: JSX.Element | JSX.Element[];
  type?: NotecardType;
  extraClasses?: string | null;
}) {
  const classes = `notecard ${type !== "info" ? type : ""} ${
    extraClasses || ""
  }`.trim();

  return <div className={classes}>{children}</div>;
}
