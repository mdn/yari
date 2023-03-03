import express from "express";
import { handler } from "./app.js";

const contentApp = express();
const contentPort = 3000;

contentApp.all("*", handler);
contentApp.listen(contentPort, () => {
  console.log(`Content app listening on port ${contentPort}`);
});
contentApp.listen(5042, () => {
  console.log(`Sample app listening on port ${5042}`);
});
