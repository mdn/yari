import { Fzf, FzfResultItem } from "fzf";

export interface Doc {
  url: string;
  title: string;
}

export type Substring = {
  str: string;
  match: boolean;
};

export class FuzzySearch {
  haystack: Fzf<Doc>;

  constructor(haystack: Doc[]) {
    this.haystack = new Fzf(haystack, {
      selector: (item) => item.url,
    });
  }

  search(needle: string, { limit = 10 }): FzfResultItem<Doc>[] {
    return this.haystack.find(needle).slice(0, limit);
  }
}
