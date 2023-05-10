class IndexAliasError extends Error {
  // When there's something wrong with finding the index alias.
}

export async function searchIndex(
  buildroot: string,
  url: string,
  options: {
    update: boolean;
    noProgressbar: boolean;
  }
): Promise<void> {
  // TODO.
}
