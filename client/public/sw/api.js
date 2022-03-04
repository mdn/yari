importScripts("./sw/jsstore.min.js");
importScripts("./sw/jsstore.worker.min.js");

const TABLE_WHOAMI = {
  name: "whoami",
  columns: {
    id: {
      primaryKey: true,
      dataType: "number",
      autoIncrement: true,
    },
    username: {
      dataType: "string",
    },
    is_authenticated: {
      dataType: "boolean",
    },
    email: {
      dataType: "string",
    },
    avatar_url: {
      dataType: "string",
    },
    is_subscriber: {
      dataType: "boolean",
    },
  },
};

const TABLE_COLLECTIONS = {
  name: "collections",
  columns: {
    url: {
      primaryKey: true,
      dataType: "string",
    },
    title: {
      dataType: "string",
    },
    parents: {
      dataType: "array",
    },
    notes: {
      dataType: "string",
    },
  },
};

const TABLE_WATCHED = {
  name: "watched_items",
  columns: {
    url: {
      primaryKey: true,
      dataType: "string",
    },
    title: {
      dataType: "string",
    },
    path: {
      dataType: "string",
    },
  },
};

// id	103
// title	"browserAction.getBadgeBackgroundColor()"
// text	"is now reporting compatibility data for 1 subfeature"
// url	"/"
// created	"2022-02-20T20:01:43.581Z"
// deleted	false
// read	true
// starred	false

const TABLE_NOTIFICATIONS = {
  name: "notifications",
  columns: {
    id: {
      primaryKey: true,
      dataType: "number",
    },
    title: {
      dataType: "string",
    },
    text: {
      dataType: "string",
    },
    url: {
      dataType: "string",
    },
    created: {
      dataType: "string", //ISO string
    },
    read: {
      dataType: "boolean",
    },
    starred: {
      dataType: "boolean",
    },
  },
};

const SCHEMA = {
  name: "MDN",
  tables: [TABLE_COLLECTIONS, TABLE_WHOAMI, TABLE_WATCHED, TABLE_NOTIFICATIONS],
};

async function initDb() {
  const connection = new JsStore.Connection();
  const isDbCreated = await connection.initDb(SCHEMA);
  if (isDbCreated) {
    console.log("db created");
  } else {
    console.log("db opened");
  }
  return connection;
}
