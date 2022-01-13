import { Link } from "react-router-dom";
import React, { useEffect, useContext } from "react";
import _ from "lodash";
import { Button } from "../../../ui/atoms/button";

import { useUIStatus } from "../../../ui-context";

import "./index.scss";

function CalculateSidebarOnScroll() {
  useEffect(function mount() {
    function calcOnScroll() {
      let sidebar = document.getElementById("sidebar-quicklinks");
      if (sidebar) {
        let sidebarTop = sidebar.getBoundingClientRect().top;
        let sidebarTopString = sidebarTop.toString();
        let sidebarTopPx = sidebarTopString + "px";
        document.documentElement.style.setProperty(
          "--visible-height-of-header",
          sidebarTopPx
        );
      }
    }

    window.addEventListener(
      "scroll",
      _.throttle(calcOnScroll, 30, {
        leading: true,
        trailing: true,
      })
    );

    return function unMount() {
      window.removeEventListener("scroll", calcOnScroll);
    };
  });

  return null;
}

function SidebarContainer({ children }) {
  const { isSidebarOpen, setIsSidebarOpen } = useUIStatus();
  const classes = `sidebar ${isSidebarOpen ? "is-expanded" : ""}`;

  return (
    <>
      <nav id="sidebar-quicklinks" className={classes}>
        <Button
          extraClasses="backdrop"
          type="action"
          onClickHandler={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="sidebar-inner">{children}</div>
      </nav>
      <CalculateSidebarOnScroll />
    </>
  );
}

export function RenderSideBar({ doc }) {
  if (!doc.related_content) {
    if (doc.sidebarHTML) {
      return (
        <SidebarContainer>
          <h4 className="sidebar-heading">Related Topics</h4>
          <div
            dangerouslySetInnerHTML={{
              __html: `${doc.sidebarHTML}`,
            }}
          />
        </SidebarContainer>
      );
    }
    return null;
  }
  return doc.related_content.map((node) => (
    <SidebarLeaf key={node.title} parent={node} />
  ));
}

function SidebarLeaf({ parent }) {
  return (
    <SidebarContainer>
      <h4 className="sidebar-heading">{parent.title}</h4>
      <ul>
        {parent.content.map((node) => {
          if (node.content) {
            return (
              <li key={node.title}>
                <SidebarLeaflets node={node} />
              </li>
            );
          } else {
            return (
              <li key={node.uri}>
                <Link to={node.uri}>{node.title}</Link>
              </li>
            );
          }
        })}
      </ul>
    </SidebarContainer>
  );
}

function SidebarLeaflets({ node }) {
  return (
    <details open={node.open}>
      <summary>
        {node.uri ? <Link to={node.uri}>{node.title}</Link> : node.title}
      </summary>
      <ol>
        {node.content.map((childNode) => {
          if (childNode.content) {
            return (
              <li key={childNode.title}>
                <SidebarLeaflets node={childNode} />
              </li>
            );
          } else {
            return (
              <li
                key={childNode.uri}
                className={childNode.isActive && "active"}
              >
                <Link to={childNode.uri}>{childNode.title}</Link>
              </li>
            );
          }
        })}
      </ol>
    </details>
  );
}
