importScripts("./sw/jsstore.min.js");
importScripts("./sw/jsstore.worker.min.js");

const SCHEMA = {
  name: "MDN",
  tables: [
    {
      name: "Whoami",
      columns: {
        id: {
          primaryKey: true,
          dataType: "number",
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
    },
  ],
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
