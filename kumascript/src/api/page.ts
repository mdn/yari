import { KumaThis } from "../environment";

const page = {
  // Determines whether or not the page has the specified tag. Returns
  // true if it does, otherwise false. This is case-insensitive.
  //
  hasTag(aPage, aTag) {
    // First, return false at once if there are no tags on the page

    if (
      aPage.tags == undefined ||
      aPage.tags == null ||
      aPage.tags.length == 0
    ) {
      return false;
    }

    // Convert to lower case for comparing

    const theTag = aTag.toLowerCase();

    // Now look for a match

    for (let i = 0; i < aPage.tags.length; i++) {
      if (aPage.tags[i].toLowerCase() == theTag) {
        return true;
      }
    }

    return false;
  },

  // Optional path, defaults to current page
  //
  // Optional depth. Ignored. The caller may request subpages
  // as deeply as desired.
  //
  // Optional self, defaults to false. Include the path page in
  // the results
  //
  // This is not called by any macros, and is only used here by
  // wiki.tree(), so we could move it to be part of that function.
  subpages(this: KumaThis, path, depth, self) {
    return (this.page as any).subpagesExpand(path, depth, self);
  },

  // Optional path, defaults to current page
  //
  // Optional depth. Ignored. The caller may request subpages
  // as deeply as desired.
  //
  // Optional self, defaults to false. Include the path page in
  // the results
  //
  subpagesExpand(this: KumaThis, path, depth, self) {
    try {
      return this.info.getChildren(path || this.env.url, self);
    } catch (e) {
      const error = e as Error;
      this.env.recordNonFatalError("bad-pages", error.message);
      // We allow ourselves to be forgiving with this function because
      // we justify it by the fact that at least we record a flaw!
      return [];
    }
  },

  // Flatten subPages list
  subPagesFlatten(pages) {
    const output: string[] = [];

    process_array(pages);

    return output;

    function process_array(arr) {
      if (arr.length) {
        arr.forEach(function (item) {
          if (!item) {
            return;
          }
          process_array(item.subpages || []);
          // If only a header for a branch
          if (item.url == "") {
            return;
          }
          item.subpages = [];
          output.push(item);
        });
      }
    }
  },

  translations(this: KumaThis, path) {
    return this.info.getTranslations(path || this.env.url);
  },
};

export default page;
