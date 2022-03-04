async function handleWhoAmI(url) {
  const db = await initDb();
  try {
    const whoami = await (await fetch(url)).json();
    if (whoami?.username) {
      await db.insert({
        into: "whoami",
        upsert: true,
        values: [{ id: 0, ...whoami }],
      });
    }
    return new Response(jsonBlob(whoami));
  } catch (error) {
    console.log(error);
    const whoami = await db.select({ from: "whoami" });
    if (whoami) {
      return new Response(jsonBlob(whoami[0]));
    }
    return new Response(jsonBlob({ geo: { country: "Iceland" } }));
  }
}

async function handleCollections(req) {
  if (req.method == "GET") {
    const db = await initDb();
    const url = new URL(req.url).searchParams.get("url");

    if (url) {
      return getSavedUrl(req, url, db);
    } else {
      return getAllSavedUrls(req, db);
    }
  }

  if (req.method == "POST") {
    return await fetch(req);
  }
}
//The output of 'Watch' vs 'Watched' is different. Individual watches contain
//additinoal info e.g metadata on
async function handleWatch(req) {
  if (req.method == "GET") {
    try {
      const fetched = await fetch(req);
      const item = await fetched.json();
      if (item) {
        const db = await initDb();
        await db.insert({
          into: "watched_items",
          upsert: true,
          values: [item],
        });
      }
    } catch (ex) {
      const db = await initDb();
      const url = new URL(req.url);
      let toWatch = url.pathname
        .split(/(\/api\/v1\/plus\/watch)(.+)/g)
        .filter(Boolean)
        .slice(1)
        .join();

      const [watched] = db.select({
        from: "watched_items",
        where: { url: toWatch },
      });
      return watched
        ? jsonBlob(watched)
        : jsonBlob({ ok: true, status: "unwatched" });
    }
  }

  if (req.method == "POST") {
    return await fetch(req);
  }
}

async function handleWatched(req) {
  try {
    const fetched = await fetch(req);
    const watched = await fetched.json();
    if (watched?.items) {
      const db = await initDb();
      await watched.items.map(async (item) => {
        await db.insert({
          into: "watched_items",
          upsert: true,
          values: [item],
        });
      });
    }
    return new Response(jsonBlob(watched));
  } catch (e) {
    const db = await initDb();
    const watched = await db.select({ from: "watched_items" });
    if (watched) {
      return new Response(
        jsonBlob({
          items: watched,
          metadata: {
            total: watched.length,
            page: 1,
            per_page: watched.length,
            max_non_subscribed: 3,
          },
        })
      );
    }
    throw e;
  }
}

async function getSavedUrl(req, url, db) {
  try {
    const fetched = await fetch(req);
    const savedUrl = await fetched.json();

    if (savedUrl.bookmarked) {
      await db.insert({
        into: "collections",
        upsert: true,
        values: [savedUrl],
        updated: new Date().toISOString(),
      });
      return new Response(jsonBlob(savedUrl));
    } else {
      return new Response(jsonBlob(savedUrl));
    }
  } catch (error) {
    const savedItem = await db.select({
      from: "collections",
      where: { url: url },
    });
    if (savedItem) {
      return new Response(jsonBlob({ bookmarked: savedItem }));
    }
    return new Response(jsonBlob({ bookmarked: null }));
  }
}

async function getAllSavedUrls(req, db) {
  try {
    const fetched = await fetch(req);
    const collections = await fetched.json();
    if (collections?.items) {
      await collections.items.map(async (item) => {
        await db.insert({
          into: "collections",
          upsert: true,
          values: [item],
          updated: new Date().toISOString(),
        });
      });
    }
    return new Response(jsonBlob(collections));
  } catch (e) {
    const collections = await db.select({ from: "collections" });
    if (collections) {
      return new Response(
        jsonBlob({
          items: collections,
          metadata: {
            total: collections.length,
            page: 1,
            per_page: collections.length,
            max_non_subscribed: 3,
          },
        })
      );
    }
    throw e;
  }
}
