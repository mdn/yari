import { splitQuery } from "../../../utils";

export class SidebarFilterer {
  headings: HTMLElement[];
  parents: HTMLDetailsElement[];
  links: HTMLAnchorElement[];
  toc: HTMLElement | null;

  constructor(root: HTMLElement) {
    this.headings = Array.from(root.querySelectorAll<HTMLElement>("li strong"));
    this.parents = Array.from(
      root.querySelectorAll<HTMLDetailsElement>("details")
    );
    this.links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>("a[href]")
    );
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
    this.links.forEach((link) => this.resetLink(link));
    this.headings.forEach((heading) => this.resetHeading(heading));
    this.parents.forEach((parent) => this.resetParent(parent));
  }

  private resetLink(link: HTMLAnchorElement) {
    this.resetHighlighting(link);
    const target = this.getLinkContainer(link);
    this.toggleElement(target, true);
  }

  private getLinkContainer(link: HTMLAnchorElement) {
    return link.closest("li") || link;
  }

  private resetHeading(heading: HTMLElement) {
    const container = heading.closest("li") ?? heading;
    this.toggleElement(container, true);
  }

  private resetParent(detail: HTMLDetailsElement) {
    this.toggleElement(detail, true);
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
    this.headings.forEach((heading) => this.hideHeading(heading));
    this.parents.forEach((parent) => this.collapseParent(parent));

    // Show/hide items (+ show parents).
    const terms = splitQuery(query);
    let matchCount = 0;
    this.links.forEach((link) => {
      this.resetHighlighting(link);
      const haystack = link.innerText.toLowerCase();
      const isMatch = terms.every((needle) => haystack.includes(needle));

      const target = this.getLinkContainer(link);
      this.toggleElement(target, isMatch);

      if (isMatch) {
        matchCount++;
        this.highlightMatches(link, terms);
        this.showHeading(target);
        this.expandParents(target);
      }
    });

    return matchCount;
  }

  private hideHeading(heading: HTMLElement) {
    const container = heading.closest("li") ?? heading;
    this.toggleElement(container, false);
  }

  private collapseParent(el: HTMLDetailsElement) {
    this.toggleElement(el, false);
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

  private showHeading(target: HTMLElement) {
    const heading = this.findFirstElementBefore(target, this.headings);
    const container = heading?.closest("li") ?? heading;
    if (container) {
      this.toggleElement(container, true);
    }
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

  private expandParents(target: HTMLElement) {
    for (const parent of this.getParents(target)) {
      this.toggleElement(parent, true);
      parent.open = true;
    }
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
