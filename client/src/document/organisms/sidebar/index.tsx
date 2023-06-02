import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../../ui/atoms/button";

import { useUIStatus } from "../../../ui-context";

import "./index.scss";
import { TOC } from "../toc";
import { PLACEMENT_ENABLED } from "../../../env";
import { SidePlacement } from "../../../ui/organisms/placement";
import { SidebarFilter } from "./filter";

export function SidebarContainer({
  doc,
  label,
  children,
}: {
  doc: any;
  label?: string;
  children: React.ReactNode;
}) {
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

    if (timeoutID) {
      return () => clearTimeout(timeoutID);
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    const sidebar = document.querySelector("#sidebar-quicklinks");
    const currentSidebarItem = sidebar?.querySelector("em");
    if (sidebar && currentSidebarItem) {
      [sidebar, sidebar.querySelector(".sidebar-inner-nav")].forEach((n) =>
        n?.scrollTo({
          top: currentSidebarItem.offsetTop - window.innerHeight / 4,
        })
      );
    }
  }, []);

  return (
    <>
      <aside
        id="sidebar-quicklinks"
        className={classes}
        data-macro={doc.sidebarMacro}
      >
        <Button
          extraClasses="backdrop"
          type="action"
          onClickHandler={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Collapse sidebar"
        />
        <nav aria-label={label} className="sidebar-inner">
          <header className="sidebar-actions">
            {doc.sidebarHTML && <SidebarFilter />}
          </header>
          <div className="sidebar-inner-nav">
            <div className="in-nav-toc">
              {doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}
            </div>
            {children}
          </div>
          {PLACEMENT_ENABLED && <SidePlacement />}
        </nav>
      </aside>
    </>
  );
}

export function RenderSideBar({ doc }) {
  if (!doc.related_content) {
    return (
      <SidebarContainer doc={doc} label="Related Topics">
        {doc.sidebarHTML && (
          <>
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
