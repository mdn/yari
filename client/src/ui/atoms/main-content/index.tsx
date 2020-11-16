import React from "react";

interface Props {
  children: React.ReactNode;
  extraClassName?: string;
}
export function MainContentContainer(props: Props) {
  return (
    <main
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
