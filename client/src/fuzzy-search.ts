import { Fzf, FzfResultItem } from "fzf";

export interface Doc {
  url: string;
  title: string;
  collection: boolean;
}

export class FuzzySearch {
  docs: Doc[];

  constructor(docs: Doc[]) {
    this.docs = docs;
  }

  search(needle: string, { limit = 10 }): FzfResultItem<Doc>[] {
    // Use `let` because we might come up with a new list (aka. shortlist)
    // that makes the haystack search much simpler to send to `Fzf()`.
    let docs = this.docs;
    // The list of docs is possible over 10,000 entries (in 2021). If the
    // search input is tiny, don't bother with the overhead of Fzf().
    // Because we don't even need it when the test is so easy in that
    // it just needs to contain a single character.
    if (needle.length <= 3) {
      const needleLowerCase = needle.toLowerCase();
      // The reason this works and makes sense is because the `this.docs` is
      // already sorted by popularity.
      // So if someone searches for something short like `x` we just take
      // the top 'limit' docs that have an `x` in the `.url`. This is
      // faster than going through every doc with Fzf.
      const shortlistDocs: Doc[] = [];
      for (const doc of this.docs) {
        if (doc.url.toLowerCase().includes(needleLowerCase)) {
          shortlistDocs.push(doc);
          if (shortlistDocs.length === limit) {
            break;
          }
        }
      }
      // Suppose the needle was `yx`  and the `limit` as 10, then if we only found
      // 9 (which is less than 10) docs that match exactly this, then we might
      // be missing out, so we can't use the shortlist.
      // For example, there might be more docs like `aaYbbbbXccc` which
      // will be found by Fzf() but wouldn't be find in our shortlist because
      // the two characters aren't next to each other.
      if (shortlistDocs.length >= limit) {
        docs = shortlistDocs;
      }
    }

    const haystack = new Fzf(docs, {
      limit,
      selector: (item: Doc) => item.url,
    });
    // All longer strings, default to using the already initialized `Fzf()` instance.
    return haystack.find(needle);
  }
}
