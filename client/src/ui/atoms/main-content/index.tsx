import React from "react";

interface Props {
  children: React.ReactNode;
  extraClassName?: string;
}
export function MainContentContainer(props: Props) {
  return (
    <main
      // This exists for the benefit of a11y navigation which
      // uses anchor links to focus in on the content.
      id="content"
      className={`main-content ${
        props.extraClassName ? props.extraClassName : ""
      }`}
      role="main"
    >
      {props.children}
    </main>
  );
}
