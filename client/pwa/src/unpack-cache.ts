import * as zip from "@zip.js/zip.js";
import { openContentCache } from "./caches";
import { INTERACTIVE_EXAMPLES_URL } from "./service-worker";

zip.configure({
  useWebWorkers: false,
});

export async function unpackAndCache(data, progress = async (number) => {}) {
  // create a BlobReader to read with a ZipReader the zip from a Blob object
  const reader = new zip.ZipReader(
    new zip.Uint8ArrayReader(new Uint8Array(data))
  );
  const entries = await reader.getEntries();
  const cache = await openContentCache();
  const total = entries.length;
  let index = 0;
  let removed;
  for (const entry of entries) {
    index += 1;
    if (index % 100 === 0) {
      console.log(`${index}/${total}`);
      await progress(index / total);
    }
    if (entry.filename === "removed") {
      const writer = new zip.TextWriter();
      const data = await (entry as any).getData(writer);
      removed = data.split("\n");
    }
    if (entry.directory) {
      continue;
    }
    const writer = new zip.BlobWriter();
    const data = await (entry as any).getData(writer);
    const location = getLocation(entry.filename);
    const response = new Response(data, {
      headers: {
        // As the zip says nothing about the nature of the file, we extract
        // this information from the file name.
        "Content-Type": getContentType(entry.filename),
      },
    });

    console.log(
      "-> Caching",
      location,
      "(size:",
      entry.uncompressedSize,
      "bytes)"
    );

    await cache.put(location, response);
  }
  await reader.close();
  if (removed) {
    await Promise.all(
      removed.map((remove) =>
        cache.delete(getLocation(remove), {
          ignoreSearch: true,
          ignoreMethod: true,
          ignoreVary: true,
        })
      )
    );
  }
  console.log(removed);
}

function getLocation(filename) {
  if (filename.startsWith("examples/")) {
    return filename.replace("examples", INTERACTIVE_EXAMPLES_URL);
  }
  return `${self.location.origin}/${filename}`;
}

const contentTypesByExtension = {
  css: "text/css",
  js: "application/javascript",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  html: "text/html",
  htm: "text/html",
  json: "application/json",
};

function getContentType(filename) {
  const tokens = filename.split(".");
  const extension = tokens[tokens.length - 1];
  return contentTypesByExtension[extension] || "text/plain";
}
