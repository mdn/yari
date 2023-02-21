import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../../ui/atoms/button";

import { useUIStatus } from "../../../ui-context";

import "./index.scss";
import { TOC } from "../toc";
import { useGleanClick } from "../../../telemetry/glean-context";
import {
  getLineDistance,
  getSlugDistance,
  getTreeDistance,
  isElementInViewport,
} from "../../../utils";
import { SIDEBAR_CLICK } from "../../../telemetry/constants";

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
      [sidebar, sidebar.querySelector(".sidebar-inner")].forEach((n) =>
        n?.scrollTo({
          top: currentSidebarItem.offsetTop - window.innerHeight / 3,
        })
      );
    }
  }, []);

  return (
    <>
      <aside id="sidebar-quicklinks" className={classes}>
        <Button
          extraClasses="backdrop"
          type="action"
          onClickHandler={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Collapse sidebar"
        />
        <nav aria-label={label} className="sidebar-inner">
          <div className="in-nav-toc">
            {doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}
          </div>
          {children}
        </nav>
      </aside>
    </>
  );
}

function useSidebarMetricsCallback() {
  const gleanClick = useGleanClick();
  const cleanupFunc = useRef<Function | null>(null);

  return useCallback(
    (wrapper: HTMLDivElement) => {
      if (cleanupFunc.current) {
        cleanupFunc.current();
        cleanupFunc.current = null;
      }

      if (!wrapper) {
        return;
      }

      const clickListener = (event) => {
        const { target = null, currentTarget = null } = event;
        const anchor = (target as HTMLElement)?.closest("a");
        const currentPage = currentTarget.querySelector("a[aria-current=page]");
        if (
          currentTarget instanceof HTMLElement &&
          anchor instanceof HTMLAnchorElement
        ) {
          const macro = currentTarget.getAttribute("data-macro");
          const from = currentPage?.getAttribute("href");
          const to = anchor?.getAttribute("href");

          const lineDistance = getLineDistance(currentPage, anchor);
          const slugDistance = getSlugDistance(from, to);
          const treeDistance = getTreeDistance(currentPage, anchor, {
            boundary: currentTarget,
            selector: "details",
          });
          const isCurrentVisible = isElementInViewport(currentPage);

          const payload = JSON.stringify({
            line_dist: lineDistance,
            slug_dist: slugDistance,
            tree_dist: treeDistance,
            current_visible: Number(isCurrentVisible),
            macro,
            from,
            to,
          });
          const key = `${SIDEBAR_CLICK}: ${payload}`;
          gleanClick(key);
        }
      };

      wrapper.addEventListener("click", clickListener);

      cleanupFunc.current = () =>
        wrapper.removeEventListener("click", clickListener);
    },
    [gleanClick]
  );
}

export function RenderSideBar({ doc }) {
  const sidebarRef = useSidebarMetricsCallback();

  if (!doc.related_content) {
    return (
      <SidebarContainer doc={doc} label="Related Topics">
        {doc.sidebarHTML && (
          <>
            <div
              ref={sidebarRef}
              data-macro={doc.sidebarMacro}
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
