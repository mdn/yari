// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module 'react-router-dom'. Did you mea... Remove this comment to see the full error message
import { Link } from "react-router-dom";
// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import React, { useEffect, useState } from "react";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../../ui/atoms/button'. Did... Remove this comment to see the full error message
import { Button } from "../../../ui/atoms/button";

import { useUIStatus } from "../../../ui-context";

import "./index.scss";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../toc'. Did you mean to set t... Remove this comment to see the full error message
import { TOC } from "../toc";

function _setScrollLock(isSidebarOpen) {
  const mainContentElement = document.querySelector("main");

  if (isSidebarOpen) {
    document.body.style.overflow = "hidden";
    if (mainContentElement) {
      mainContentElement.style.overflow = "hidden";
    }
  } else {
    document.body.style.overflow = "";
    if (mainContentElement) {
      mainContentElement.style.overflow = "";
    }
  }
}

export function SidebarContainer({ doc, children }) {
  const { isSidebarOpen, setIsSidebarOpen } = useUIStatus();
  const [classes, setClasses] = useState<string>("sidebar");

  useEffect(() => {
    let timeoutID;

    if (isSidebarOpen) {
      setClasses("sidebar is-expanded");
    } else {
      setClasses("sidebar is-animating");
      timeoutID = setTimeout(() => {
        setClasses("sidebar");
      }, 300);
    }

    _setScrollLock(isSidebarOpen);

    if (timeoutID) {
      return () => clearTimeout(timeoutID);
    }
  }, [isSidebarOpen]);

  return (
    <>
      <nav id="sidebar-quicklinks" className={classes}>
        <Button
          extraClasses="backdrop"
          type="action"
          onClickHandler={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="sidebar-inner">
          <div className="in-nav-toc">
            {doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}
          </div>
          {children}
        </div>
      </nav>
    </>
  );
}

export function RenderSideBar({ doc }) {
  if (!doc.related_content) {
    return (
      <SidebarContainer doc={doc}>
        {doc.sidebarHTML && (
          <>
            <h4 className="sidebar-heading">Related Topics</h4>
            <div
              dangerouslySetInnerHTML={{
                __html: `${doc.sidebarHTML}`,
              }}
            />
          </>
        )}
      </SidebarContainer>
    );
  }
  return doc.related_content.map((node) => (
    <SidebarLeaf key={node.title} parent={node} doc={doc} />
  ));
}

function SidebarLeaf({ doc, parent }) {
  return (
    <SidebarContainer doc={doc}>
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
