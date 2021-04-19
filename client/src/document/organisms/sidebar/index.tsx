import { Link } from "react-router-dom";

import "./index.scss";
import { Doc, RelatedContent } from "../../types";

function SidebarContainer({ children }) {
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
        {doc.related_content.map((node) => (
          <SidebarLeaf key={node.url} parent={node} />
        ))}
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
        {parent.url ? (
          <Link to={parent.url}>{parent.title}</Link>
        ) : (
          parent.title
        )}
      </h5>
      <ul>
        {parent.content.map((node) => {
          if (node.content) {
            return (
              <li key={node.url}>
                <SidebarLeaflets node={node} />
              </li>
            );
          } else {
            return (
              <li
                key={node.url}
                className={node.isActive ? "active" : undefined}
              >
                <Link to={node.url}>{node.title}</Link>
              </li>
            );
          }
        })}
      </ul>
    </>
  );
}

function SidebarLeaflets({ node }: { node: RelatedContent }) {
  return (
    <details open={node.open}>
      <summary>
        {node.url ? <Link to={node.url}>{node.title}</Link> : node.title}
      </summary>
      <ol>
        {node.content.map((childNode) => {
          if (childNode.content) {
            return (
              <li key={childNode.url}>
                <SidebarLeaflets node={childNode} />
              </li>
            );
          } else {
            return (
              <li
                key={childNode.url}
                className={childNode.isActive ? "active" : undefined}
              >
                <Link to={childNode.url}>{childNode.title}</Link>
              </li>
            );
          }
        })}
      </ol>
    </details>
  );
}
