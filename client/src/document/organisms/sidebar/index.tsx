import { Link } from "react-router-dom";

import "./index.scss";

function SidebarContainer({ children }) {
  return (
    <nav id="sidebar-quicklinks" className="sidebar">
      {children}
    </nav>
  );
}

export function RenderSideBar({ doc }) {
  if (!doc.related_content) {
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
  return doc.related_content.map((node) => (
    <SidebarLeaf key={node.title} parent={node} />
  ));
}

function SidebarLeaf({ parent }) {
  return (
    <SidebarContainer>
      <h4>{parent.title}</h4>
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
