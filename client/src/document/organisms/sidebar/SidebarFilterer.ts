import { splitQuery } from "../../../utils";

export class SidebarFilterer {
  allHeadings: HTMLElement[];
  allParents: HTMLDetailsElement[];
  items: Array<{
    haystack: string;
    link: HTMLAnchorElement;
    container: HTMLElement;
    heading: HTMLElement | undefined;
    parents: HTMLDetailsElement[];
  }>;
  toc: HTMLElement | null;

  constructor(root: HTMLElement) {
    this.allHeadings = Array.from(
      root.querySelectorAll<HTMLElement>("li strong")
    );
    this.allParents = Array.from(
      root.querySelectorAll<HTMLDetailsElement>("details")
    );

    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>("a[href]")
    );

    this.items = links.map((link) => ({
      haystack: link.innerText.toLowerCase(),
      link,
      container: this.getContainer(link),
      heading: this.getHeading(link),
      parents: this.getParents(link),
    }));

    this.toc =
      root.closest<HTMLElement>(".sidebar")?.querySelector(".in-nav-toc") ??
      null;
  }

  applyFilter(query: string) {
    if (query) {
      this.toggleTOC(false);
      return this.showOnlyMatchingItems(query);
    } else {
      this.toggleTOC(true);
      this.showAllItems();
      return undefined;
    }
  }

  private toggleTOC(show: boolean) {
    if (this.toc) {
      this.toggleElement(this.toc, show);
    }
  }

  private toggleElement(el: HTMLElement, show: boolean) {
    el.style.display = show ? "" : "none";
  }

  showAllItems() {
    this.items.forEach(({ link }) => this.resetLink(link));
    this.allHeadings.forEach((heading) => this.resetHeading(heading));
    this.allParents.forEach((parent) => this.resetParent(parent));
  }

  private resetLink(link: HTMLAnchorElement) {
    this.resetHighlighting(link);
    const container = this.getContainer(link);
    this.toggleElement(container, true);
  }

  private getContainer(el: HTMLElement) {
    return el.closest("li") || el;
  }

  private resetHeading(heading: HTMLElement) {
    const container = this.getContainer(heading);
    this.toggleElement(container, true);
  }

  private resetParent(detail: HTMLDetailsElement) {
    const container = this.getContainer(detail);
    this.toggleElement(container, true);
    if (detail.dataset.wasOpen) {
      detail.open = JSON.parse(detail.dataset.wasOpen);
      delete detail.dataset.wasOpen;
    }
  }

  private resetHighlighting(link: HTMLAnchorElement) {
    const nodes = Array.from(link.querySelectorAll<HTMLElement>("span, mark"));
    const parents = new Set<HTMLElement>();
    nodes.forEach((node) => {
      const parent = node.parentElement;
      node.replaceWith(document.createTextNode(node.textContent ?? ""));
      if (parent) {
        parents.add(parent);
      }
    });
    parents.forEach((parent) => parent.normalize());
  }

  showOnlyMatchingItems(query: string) {
    this.allHeadings.forEach((heading) => this.hideHeading(heading));
    this.allParents.forEach((parent) => this.collapseParent(parent));

    // Show/hide items (+ show parents).
    const terms = splitQuery(query);
    let matchCount = 0;
    this.items.forEach(({ haystack, link, container, heading, parents }) => {
      this.resetHighlighting(link);
      const isMatch = terms.every((needle) => haystack.includes(needle));

      this.toggleElement(container, isMatch);

      if (isMatch) {
        matchCount++;
        this.highlightMatches(link, terms);
        if (heading) {
          this.showHeading(heading);
        }
        for (const parent of parents) {
          this.expandParent(parent);
        }
      }
    });

    return matchCount;
  }

  private hideHeading(heading: HTMLElement) {
    const container = this.getContainer(heading);
    this.toggleElement(container, false);
  }

  private collapseParent(el: HTMLDetailsElement) {
    const container = this.getContainer(el);
    this.toggleElement(container, false);
    el.dataset.wasOpen = el.dataset.wasOpen ?? String(el.open);
    el.open = false;
  }

  private highlightMatches(el: HTMLElement, terms: string[]) {
    const nodes = this.getTextNodes(el);

    nodes.forEach((node) => {
      const haystack = node.textContent?.toLowerCase();
      if (!haystack) {
        return;
      }

      const ranges = new Map<number, number>();
      terms.forEach((needle) => {
        const index = haystack.indexOf(needle);
        if (index !== -1) {
          ranges.set(index, index + needle.length);
        }
      });
      const sortedRanges = Array.from(ranges.entries()).sort(
        ([x1, y1], [x2, y2]) => x1 - x2 || y1 - y2
      );

      const span = this.replaceChildNode(node, "span");
      span.className = "highlight-container";

      let rest = span.childNodes[0] as Node & Text;
      let cursor = 0;

      for (const [rangeBegin, rangeEnd] of sortedRanges) {
        if (rangeBegin < cursor) {
          // Just ignore conflicting range.
          continue;
        }

        // Split.
        const match = rest.splitText(rangeBegin - cursor);
        const newRest = match.splitText(rangeEnd - rangeBegin);

        // Convert text node to HTML element.
        this.replaceChildNode(match, "mark");

        rest = newRest as Element & Text;
        cursor = rangeEnd;
      }
    });
  }

  private getTextNodes(parentNode: Node): (Node & Text)[] {
    const parents = [parentNode];
    const nodes: (Node & Text)[] = [];

    for (const parent of parents) {
      for (const childNode of parent.childNodes) {
        if (childNode.nodeType === Node.TEXT_NODE) {
          nodes.push(childNode as Node & Text);
        } else if (childNode.hasChildNodes()) {
          parents.push(childNode);
        }
      }
    }

    return nodes;
  }

  private replaceChildNode(node: ChildNode, tagName: string) {
    const text = node.textContent;
    const newNode = document.createElement(tagName);
    newNode.innerText = text ?? "";
    node.replaceWith(newNode);
    return newNode;
  }

  private showHeading(heading: HTMLElement) {
    const container = heading && this.getContainer(heading);
    if (container) {
      this.toggleElement(container, true);
    }
  }

  private getHeading(el: HTMLElement) {
    return this.findFirstElementBefore(el, this.allHeadings);
  }

  private findFirstElementBefore(
    target: HTMLElement,
    candidates: HTMLElement[]
  ) {
    return candidates
      .slice()
      .reverse()
      .find(
        (candidate) =>
          candidate.compareDocumentPosition(target) &
          Node.DOCUMENT_POSITION_FOLLOWING
      );
  }

  private expandParent(parent: HTMLDetailsElement) {
    const container = this.getContainer(parent);
    this.toggleElement(container, true);
    parent.open = true;
  }

  private getParents(el: HTMLElement) {
    const parents: HTMLDetailsElement[] = [];
    let parent = el.parentElement?.closest("details");

    while (parent) {
      if (parent instanceof HTMLDetailsElement) {
        parents.push(parent);
      }
      parent = parent.parentElement?.closest("details");
    }

    return parents;
  }
}
