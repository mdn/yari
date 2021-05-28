import { Link } from "react-router-dom";

import "./index.scss";
import { Doc, RelatedContent } from "../../types";
import React from "react";

function SidebarContainer({ children }: { children: React.ReactNode }) {
  return (
    <nav id="sidebar-quicklinks" className="sidebar">
      {children}
    </nav>
  );
}

export function RenderSideBar({ doc }: { doc: Doc }) {
  if (doc.related_content) {
    return (
      <SidebarContainer>
        <h4>Related Topics</h4>
        {doc.related_content.map((node) => {
          return <SidebarLeaf key={node.url || node.title} parent={node} />;
        })}
      </SidebarContainer>
    );
  }
  if (doc.sidebarHTML) {
    return (
      <SidebarContainer>
        <h4>Related Topics</h4>
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

function SidebarLeaf({ parent }: { parent: RelatedContent }) {
  return (
    <>
      <h5>
        {parent.url ? <a href={parent.url}>{parent.title}</a> : parent.title}
      </h5>
      <ol>
        {parent.content.map((node) => {
          if (node.content) {
            return (
              <li key={node.url || node.title} className="toggle">
                <SidebarLeaflets node={node} />
              </li>
            );
          } else {
            return (
              <li
                key={node.url}
                className={node.isActive ? "active" : undefined}
              >
                <a href={node.url}>{node.title}</a>
              </li>
            );
          }
        })}
      </ol>
    </>
  );
}

function SidebarLeaflets({ node }: { node: RelatedContent }) {
  return (
    <details open={node.containsActive}>
      <summary>
        {node.url ? <Link to={node.url}>{node.title}</Link> : node.title}
      </summary>
      <ol>
        {node.content.map((childNode) => {
          if (childNode.content) {
            console.log(childNode.url || childNode.title);

            return (
              <li key={childNode.url || childNode.title}>
                <SidebarLeaflets node={childNode} />
              </li>
            );
          } else {
            return (
              <li
                key={childNode.url}
                className={childNode.isActive ? "active" : undefined}
              >
                {/* Figure out how to set 'aria-current'
                https://reactrouter.com/web/api/NavLink/aria-current-string
                 */}
                {childNode.url.startsWith("http") ? (
                  <a href={childNode.url} className="external">
                    {childNode.title}
                  </a>
                ) : (
                  <a href={childNode.url}>{childNode.title}</a>
                )}
              </li>
            );
          }
        })}
      </ol>
    </details>
  );
}
