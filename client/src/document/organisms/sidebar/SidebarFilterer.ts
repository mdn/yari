import { splitQuery } from "../../../utils";

export class SidebarFilterer {
  applyFilter(query: string) {
    if (query) {
      return this.showOnlyMatchingItems(query);
    } else {
      this.showAllItems();
      return undefined;
    }
  }
  root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  private get parents(): HTMLDetailsElement[] {
    return Array.from(
      this.root.querySelectorAll<HTMLDetailsElement>("details")
    );
  }

  private get links(): HTMLAnchorElement[] {
    return Array.from(this.root.querySelectorAll<HTMLAnchorElement>("a[href]"));
  }

  showAllItems() {
    this.links.forEach((link) => this.resetLink(link));
    this.parents.forEach((parent) => this.resetParent(parent));
  }

  private resetLink(link: HTMLAnchorElement) {
    this.resetHighlighting(link);
    const target = link.closest("li") || link;
    target.style.display = "inherit";
  }

  private resetParent(detail: HTMLDetailsElement) {
    detail.style.display = "inherit";
    if (detail.dataset.open) {
      detail.open = JSON.parse(detail.dataset.open);
      delete detail.dataset.open;
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
    this.parents.forEach(this.collapseDetail);

    // Show/hide items (+ show parents).
    const terms = splitQuery(query);
    let matchCount = 0;
    this.links.forEach((link) => {
      this.resetHighlighting(link);
      const haystack = link.innerText.toLowerCase();
      const isMatch = terms.every((needle) => haystack.includes(needle));

      const target = link.closest("li") || link;
      target.style.display = isMatch ? "inherit" : "none";

      if (isMatch) {
        matchCount++;
        this.highlightMatches(link, terms);
        this.expandParents(target);
      }
    });

    return matchCount;
  }

  private collapseDetail(el: HTMLDetailsElement) {
    el.style.display = "none";
    el.dataset.open = el.dataset.open ?? String(el.open);
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

        // Convert text nodes to HTML elements.
        this.replaceChildNode(rest, "span");
        this.replaceChildNode(match, "mark");

        rest = newRest as Element & Text;
        cursor = rangeEnd;
      }

      this.replaceChildNode(rest, "span");
    });
  }

  private getTextNodes(parentNode: Node): (Node & Text)[] {
    const parents = [parentNode];
    const nodes: (Node & Text)[] = [];

    while (parents.length) {
      const parent = parents.shift() as Node;
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

  private expandParents(target: HTMLElement) {
    let parent = target.parentElement?.closest("details");
    while (parent) {
      if (parent instanceof HTMLDetailsElement) {
        parent.style.display = "inherit";
        parent.open = true;
      }
      parent = parent.parentElement?.closest("details");
    }
  }
}
