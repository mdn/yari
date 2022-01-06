import React from "react";

import "./index.scss";
import { Toc } from "../../types";

// This component needed to be a class, because IntersectionObservers have trouble
// finding react hooks' state variables. IntersectionObservers were referencing only the
// first state, even though the values changed with time.
// Having a class instance on memory made it persistent.
export class TOC extends React.Component<
  { toc: Toc[] },
  { currentViewedTocItems: string[] }
> {
  constructor(props) {
    super(props);
    this.state = {
      currentViewedTocItems: [],
    };
  }

  handleViewed = (itemId, entry) => {
    const { currentViewedTocItems } = this.state;

    if (entry.isIntersecting && !currentViewedTocItems.includes(itemId)) {
      this.setState({
        currentViewedTocItems: [...currentViewedTocItems, itemId],
      });
    } else if (!entry.isIntersecting) {
      this.setState({
        currentViewedTocItems: currentViewedTocItems.filter(
          (id) => id !== itemId
        ),
      });
    }
  };

  render() {
    const { currentViewedTocItems } = this.state;
    const { toc } = this.props;

    return (
      <aside className="document-toc-container">
        <section className="document-toc">
          <header>
            <h2 className="document-toc-heading">In this article</h2>
          </header>
          <ul className="document-toc-list" id="toc-entries">
            {toc.map((item) => {
              return (
                <TOCItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  handleViewed={this.handleViewed}
                  currentViewedTocItems={currentViewedTocItems}
                />
              );
            })}
          </ul>
        </section>
      </aside>
    );
  }
}

function TOCItem({
  id,
  text,
  currentViewedTocItems,
  handleViewed,
}: Toc & {
  currentViewedTocItems: string[];
  handleViewed: (string, IntersectionObserverEntry) => void;
}) {
  React.useEffect(() => {
    const relatedSectionElement = document.getElementById(
      id.toLowerCase()
    )?.nextElementSibling;

    const currentObserver = new IntersectionObserver(
      (entry) => {
        handleViewed(id, entry[0]);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    if (relatedSectionElement) {
      currentObserver.observe(relatedSectionElement);
    }
  }, [handleViewed, id]);

  return (
    <li className="document-toc-item">
      <a
        className="document-toc-link"
        key={id}
        aria-current={currentViewedTocItems[0] === id || undefined}
        href={`#${id.toLowerCase()}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </li>
  );
}
