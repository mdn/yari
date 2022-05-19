import { ReactNode } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/icon'. Did you mea... Remove this comment to see the full error message
import { Icon } from "../../atoms/icon";
import "./index.scss";

export function Quote({
  name,
  title,
  org,
  children,
  extraClasses,
}: {
  name: string;
  title?: string;
  org?: string;
  children: ReactNode;
  extraClasses?: string | null;
}) {
  return (
    <blockquote className={`quote ${extraClasses || ""}`}>
      <h4 className="name">
        {name}
        {title && <span className="title">, {title}</span>}
        {org && <span className="org">, {org}</span>}
      </h4>
      <p>
        <Icon name="quote"></Icon>
        {children}
      </p>
    </blockquote>
  );
}
